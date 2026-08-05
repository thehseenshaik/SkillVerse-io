const express = require('express');
const router = express.Router();
const { db } = require('../index');

// Get user data by UID
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // Return empty user object instead of 404
      return res.json({
        connections: {},
        cachedData: {},
        profile: {}
      });
    }

    const userData = userDoc.data();

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

module.exports = router;
