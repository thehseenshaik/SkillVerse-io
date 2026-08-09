const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { db } = require('../index');
const { APTITUDE_QUESTIONS } = require('../data/aptitudeQuestions');

// In-memory active session cache fallback
const memorySessions = new Map();
const memoryHistory = new Map(); // uid -> history array

// Cryptographically secure shuffle
function secureShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const randomBuffer = crypto.randomBytes(4);
    const randomIndex = randomBuffer.readUInt32BE(0) % (i + 1);
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
  return arr;
}

// Balance questions by topic and difficulty
function selectBalancedQuestions(category, difficulty, requestedCount = 15, company) {
  // 1. Filter by category
  let pool = APTITUDE_QUESTIONS.filter((q) => {
    if (category && category !== 'all' && q.category !== category) return false;
    if (company && company !== 'All' && !q.tags.includes(company)) return false;
    return true;
  });

  if (pool.length === 0) {
    pool = APTITUDE_QUESTIONS.filter((q) => !category || category === 'all' || q.category === category);
  }

  // 2. Filter / balance by difficulty
  let selected = [];
  if (difficulty && difficulty !== 'Mixed' && difficulty !== 'mixed') {
    const diffPool = pool.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    const fallbackPool = pool.filter((q) => q.difficulty.toLowerCase() !== difficulty.toLowerCase());
    selected = secureShuffle(diffPool.length >= requestedCount ? diffPool : [...diffPool, ...secureShuffle(fallbackPool)]);
  } else {
    // Mixed: balance Easy (40%), Medium (40%), Hard (20%)
    const easy = secureShuffle(pool.filter((q) => q.difficulty === 'Easy'));
    const med = secureShuffle(pool.filter((q) => q.difficulty === 'Medium'));
    const hard = secureShuffle(pool.filter((q) => q.difficulty === 'Hard'));

    const countEasy = Math.max(1, Math.round(requestedCount * 0.4));
    const countMed = Math.max(1, Math.round(requestedCount * 0.4));
    const countHard = Math.max(1, requestedCount - countEasy - countMed);

    selected = [
      ...easy.slice(0, countEasy),
      ...med.slice(0, countMed),
      ...hard.slice(0, countHard),
    ];

    // If still short, fill from remaining
    if (selected.length < requestedCount) {
      const selectedIds = new Set(selected.map((q) => q.id));
      const remaining = secureShuffle(pool.filter((q) => !selectedIds.has(q.id)));
      selected.push(...remaining.slice(0, requestedCount - selected.length));
    }
  }

  // Shuffle final question set
  const shuffledQuestions = secureShuffle(selected).slice(0, requestedCount);

  // Randomize option order for each question while preserving correctness internally
  return shuffledQuestions.map((q) => {
    const randomizedOptions = secureShuffle(q.options);
    return {
      ...q,
      options: randomizedOptions,
    };
  });
}

// 1. GET Question Counts & Category Stats
router.get('/counts', (req, res) => {
  try {
    const counts = {
      total: APTITUDE_QUESTIONS.length,
      quant: APTITUDE_QUESTIONS.filter((q) => q.category === 'quant').length,
      logical: APTITUDE_QUESTIONS.filter((q) => q.category === 'logical').length,
      verbal: APTITUDE_QUESTIONS.filter((q) => q.category === 'verbal').length,
    };
    res.json({ success: true, counts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST Create New Assessment Session
router.post('/session', async (req, res) => {
  try {
    const {
      uid,
      category = 'quant',
      difficulty = 'Mixed',
      questionCount = 15,
      mode = 'assessment',
      company,
    } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'Missing user authentication ID' });
    }

    const count = Math.min(30, Math.max(5, parseInt(questionCount) || 15));
    const questions = selectBalancedQuestions(category, difficulty, count, company);

    const sessionId = `apt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const durationMins = count * 1.25; // 1.25 mins per question (e.g. 20 mins for 15 Qs)
    const startedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + durationMins * 60 * 1000).toISOString();

    const sessionRecord = {
      sessionId,
      uid,
      category,
      difficulty,
      mode,
      questionCount: questions.length,
      durationMins,
      startedAt,
      expiresAt,
      status: 'active',
      questions, // internal representation with correct answers
      answers: {},
      flags: [],
      timeSpentSeconds: 0,
    };

    // Save to Firestore if available, otherwise memory
    if (db) {
      try {
        await db.collection('aptitude_sessions').doc(sessionId).set(sessionRecord);
      } catch (err) {
        console.warn('Firestore write failed, using memory store:', err.message);
      }
    }
    memorySessions.set(sessionId, sessionRecord);

    // Client-safe questions: strip correctAnswer and explanation in assessment mode
    const clientQuestions = questions.map((q, idx) => ({
      id: q.id,
      index: idx + 1,
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      estimatedSeconds: q.estimatedSeconds,
      tags: q.tags,
    }));

    res.json({
      success: true,
      session: {
        sessionId,
        category,
        difficulty,
        mode,
        questionCount: clientQuestions.length,
        durationMins,
        startedAt,
        expiresAt,
        questions: clientQuestions,
      },
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. GET Active Session Details (for page reload / session recovery)
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { uid } = req.query;

    let session = memorySessions.get(sessionId);
    if (!session && db) {
      const doc = await db.collection('aptitude_sessions').doc(sessionId).get();
      if (doc.exists) session = doc.data();
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (uid && session.uid !== uid) {
      return res.status(403).json({ error: 'Unauthorized session access' });
    }

    // Check expiry
    const isExpired = new Date(session.expiresAt).getTime() < Date.now();
    if (isExpired && session.status === 'active') {
      session.status = 'expired';
    }

    const clientQuestions = session.questions.map((q, idx) => ({
      id: q.id,
      index: idx + 1,
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      estimatedSeconds: q.estimatedSeconds,
      tags: q.tags,
    }));

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        category: session.category,
        difficulty: session.difficulty,
        mode: session.mode,
        status: session.status,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        durationMins: session.durationMins,
        answers: session.answers || {},
        flags: session.flags || [],
        questions: clientQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST Submit Answer to a Question
router.post('/session/:sessionId/answer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { uid, questionId, selectedOption, responseTime, flagged } = req.body;

    let session = memorySessions.get(sessionId);
    if (!session && db) {
      const doc = await db.collection('aptitude_sessions').doc(sessionId).get();
      if (doc.exists) session = doc.data();
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is no longer active' });
    }

    // Record answer
    session.answers[questionId] = selectedOption;
    if (flagged !== undefined) {
      const flagSet = new Set(session.flags || []);
      if (flagged) flagSet.add(questionId);
      else flagSet.delete(questionId);
      session.flags = Array.from(flagSet);
    }

    memorySessions.set(sessionId, session);
    if (db) {
      db.collection('aptitude_sessions').doc(sessionId).update({
        answers: session.answers,
        flags: session.flags,
      }).catch(() => {});
    }

    // If Practice mode: provide instant correctness feedback
    const targetQ = session.questions.find((q) => q.id === questionId);
    if (session.mode === 'practice' && targetQ) {
      const isCorrect = targetQ.correctAnswer === selectedOption;
      return res.json({
        success: true,
        saved: true,
        feedback: {
          isCorrect,
          correctAnswer: targetQ.correctAnswer,
          explanation: targetQ.explanation,
        },
      });
    }

    // Assessment mode: just confirm saved
    res.json({ success: true, saved: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. POST Complete & Evaluate Final Assessment
router.post('/session/:sessionId/submit', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { uid, answers = {}, timeSpentSeconds = 0 } = req.body;

    let session = memorySessions.get(sessionId);
    if (!session && db) {
      const doc = await db.collection('aptitude_sessions').doc(sessionId).get();
      if (doc.exists) session = doc.data();
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Merge any final answers submitted in payload
    const mergedAnswers = { ...session.answers, ...answers };

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const topicStats = {};
    const difficultyStats = {
      Easy: { correct: 0, total: 0 },
      Medium: { correct: 0, total: 0 },
      Hard: { correct: 0, total: 0 },
    };

    const reviewQuestions = session.questions.map((q, idx) => {
      const selected = mergedAnswers[q.id];
      const isAnswered = selected !== undefined && selected !== null && selected !== '';
      const isCorrect = isAnswered && selected === q.correctAnswer;

      if (!isAnswered) skippedCount++;
      else if (isCorrect) correctCount++;
      else incorrectCount++;

      // Topic stats
      if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
      topicStats[q.topic].total += 1;
      if (isCorrect) topicStats[q.topic].correct += 1;

      // Difficulty stats
      const diff = q.difficulty || 'Medium';
      if (difficultyStats[diff]) {
        difficultyStats[diff].total += 1;
        if (isCorrect) difficultyStats[diff].correct += 1;
      }

      return {
        id: q.id,
        index: idx + 1,
        category: q.category,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        userAnswer: selected || null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        isSkipped: !isAnswered,
        explanation: q.explanation,
      };
    });

    const totalQuestions = session.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const accuracy = correctCount + incorrectCount > 0
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
      : 0;

    const resultRecord = {
      sessionId,
      uid: session.uid,
      category: session.category,
      difficulty: session.difficulty,
      mode: session.mode,
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      scorePercentage,
      accuracy,
      timeSpentSeconds,
      topicStats,
      difficultyStats,
      completedAt: new Date().toISOString(),
      reviewQuestions,
    };

    session.status = 'completed';
    session.result = resultRecord;
    memorySessions.set(sessionId, session);

    // Save attempt to user's history
    const userHistory = memoryHistory.get(session.uid) || [];
    userHistory.unshift({
      sessionId,
      category: session.category,
      difficulty: session.difficulty,
      mode: session.mode,
      score: `${correctCount}/${totalQuestions}`,
      scorePercentage,
      accuracy,
      timeSpentSeconds,
      completedAt: resultRecord.completedAt,
    });
    memoryHistory.set(session.uid, userHistory.slice(0, 20));

    if (db) {
      try {
        await db.collection('aptitude_sessions').doc(sessionId).set(session, { merge: true });
        await db.collection('users').doc(session.uid).collection('aptitude_history').doc(sessionId).set(resultRecord);
      } catch (err) {
        console.warn('Firestore history update failed:', err.message);
      }
    }

    res.json({ success: true, result: resultRecord });
  } catch (error) {
    console.error('Error evaluating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. GET User Attempt History
router.get('/history', async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.json({ success: true, history: [] });

    let history = memoryHistory.get(uid) || [];

    if (history.length === 0 && db) {
      const snap = await db.collection('users').doc(uid).collection('aptitude_history')
        .orderBy('completedAt', 'desc').limit(20).get();
      if (!snap.empty) {
        history = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            sessionId: d.sessionId,
            category: d.category,
            difficulty: d.difficulty,
            mode: d.mode,
            score: `${d.correctCount}/${d.totalQuestions}`,
            scorePercentage: d.scorePercentage,
            accuracy: d.accuracy,
            timeSpentSeconds: d.timeSpentSeconds,
            completedAt: d.completedAt,
          };
        });
        memoryHistory.set(uid, history);
      }
    }

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET Past Assessment Result Review
router.get('/session/:sessionId/result', async (req, res) => {
  try {
    const { sessionId } = req.params;
    let session = memorySessions.get(sessionId);

    if (!session && db) {
      const doc = await db.collection('aptitude_sessions').doc(sessionId).get();
      if (doc.exists) session = doc.data();
    }

    if (!session || !session.result) {
      return res.status(404).json({ error: 'Assessment result not found' });
    }

    res.json({ success: true, result: session.result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
