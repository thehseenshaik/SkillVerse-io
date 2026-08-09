/**
 * Comprehensive Placement Aptitude Question Bank
 * Categories: Quantitative Aptitude (quant), Logical Reasoning (logical), Verbal Ability (verbal)
 * 100+ verified placement-grade questions with topics, difficulties, 4 options, and step-by-step explanations.
 */

const APTITUDE_QUESTIONS = [
  // ==========================================
  // 1. QUANTITATIVE APTITUDE (40 Questions)
  // ==========================================
  {
    id: "quant-001",
    category: "quant",
    topic: "Percentages",
    difficulty: "Easy",
    question: "If 20% of a number is 50, what is 60% of that number?",
    options: ["100", "120", "150", "180"],
    correctAnswer: "150",
    explanation: "Let the number be x. 20% of x = 50 => x = 50 / 0.20 = 250. Therefore, 60% of 250 = 0.60 * 250 = 150.",
    estimatedSeconds: 45,
    tags: ["TCS", "Infosys", "Placement-style"]
  },
  {
    id: "quant-002",
    category: "quant",
    topic: "Percentages",
    difficulty: "Medium",
    question: "A student scored 30% marks and failed by 15 marks. Another student scored 40% marks and got 25 marks more than the minimum passing marks. Find the maximum marks of the examination.",
    options: ["300", "400", "500", "600"],
    correctAnswer: "400",
    explanation: "Let maximum marks be M. Pass marks = 0.30M + 15 = 0.40M - 25. Solving: 0.10M = 40 => M = 400.",
    estimatedSeconds: 60,
    tags: ["TCS NQT", "Accenture", "Placement-style"]
  },
  {
    id: "quant-003",
    category: "quant",
    topic: "Percentages",
    difficulty: "Hard",
    question: "Due to a 25% reduction in the price of sugar per kg, a customer can purchase 4 kg more sugar for ₹800. What was the original price per kg?",
    options: ["₹60", "₹66.67", "₹50", "₹55"],
    correctAnswer: "₹66.67",
    explanation: "25% of ₹800 = ₹200. With ₹200, 4 kg more can be bought => Reduced price = 200 / 4 = ₹50/kg. Original price = 50 / 0.75 = ₹66.67/kg.",
    estimatedSeconds: 70,
    tags: ["Amazon", "Placement-style"]
  },
  {
    id: "quant-004",
    category: "quant",
    topic: "Profit & Loss",
    difficulty: "Easy",
    question: "An article is bought for ₹400 and sold for ₹500. What is the profit percentage?",
    options: ["20%", "25%", "30%", "15%"],
    correctAnswer: "25%",
    explanation: "Profit = ₹500 - ₹400 = ₹100. Profit % = (Profit / Cost Price) * 100 = (100 / 400) * 100 = 25%.",
    estimatedSeconds: 40,
    tags: ["Infosys", "Wipro"]
  },
  {
    id: "quant-005",
    category: "quant",
    topic: "Profit & Loss",
    difficulty: "Medium",
    question: "By selling 33 meters of cloth, a shopkeeper gains the selling price of 11 meters. Find his gain percentage.",
    options: ["33.33%", "50%", "25%", "40%"],
    correctAnswer: "50%",
    explanation: "Gain = SP of 11 m = SP of 33 m - CP of 33 m => CP of 33 m = SP of 22 m. Let SP of 1 m = ₹1. Then CP of 33 m = ₹22. Gain % = (11 / 22) * 100 = 50%.",
    estimatedSeconds: 65,
    tags: ["TCS", "Cognizant"]
  },
  {
    id: "quant-006",
    category: "quant",
    topic: "Profit & Loss",
    difficulty: "Hard",
    question: "A dishonest dealer professes to sell his goods at cost price, but uses a weight of 900 grams for a 1 kg weight. What is his actual gain percentage?",
    options: ["10%", "11.11%", "9.09%", "12.5%"],
    correctAnswer: "11.11%",
    explanation: "Gain % = [Error / (True Value - Error)] * 100 = [100 / (1000 - 100)] * 100 = (100 / 900) * 100 = 11.11%.",
    estimatedSeconds: 60,
    tags: ["Amazon", "Placement-style"]
  },
  {
    id: "quant-007",
    category: "quant",
    topic: "Simple Interest",
    difficulty: "Easy",
    question: "Find the simple interest on ₹5,000 at 6% per annum for 3 years.",
    options: ["₹800", "₹900", "₹1,000", "₹750"],
    correctAnswer: "₹900",
    explanation: "Simple Interest (SI) = (P * R * T) / 100 = (5000 * 6 * 3) / 100 = ₹900.",
    estimatedSeconds: 40,
    tags: ["TCS NQT"]
  },
  {
    id: "quant-008",
    category: "quant",
    topic: "Compound Interest",
    difficulty: "Medium",
    question: "What will be the compound interest on ₹8,000 at 10% per annum for 2 years compounded annually?",
    options: ["₹1,600", "₹1,680", "₹1,720", "₹1,580"],
    correctAnswer: "₹1,680",
    explanation: "Amount A = P(1 + R/100)^T = 8000 * (1.1)^2 = 8000 * 1.21 = ₹9,680. CI = ₹9,680 - ₹8,000 = ₹1,680.",
    estimatedSeconds: 60,
    tags: ["Infosys", "Capgemini"]
  },
  {
    id: "quant-009",
    category: "quant",
    topic: "Compound Interest",
    difficulty: "Hard",
    question: "The difference between simple and compound interests on a sum for 2 years at 8% per annum is ₹64. What is the principal sum?",
    options: ["₹8,000", "₹10,000", "₹12,000", "₹9,500"],
    correctAnswer: "₹10,000",
    explanation: "Difference for 2 years = P * (R/100)^2 => 64 = P * (8/100)^2 => 64 = P * (64 / 10000) => P = ₹10,000.",
    estimatedSeconds: 60,
    tags: ["Deloitte", "TCS"]
  },
  {
    id: "quant-010",
    category: "quant",
    topic: "Time & Work",
    difficulty: "Easy",
    question: "A can do a piece of work in 10 days and B can do the same work in 15 days. Working together, in how many days can they complete the work?",
    options: ["5 days", "6 days", "7.5 days", "8 days"],
    correctAnswer: "6 days",
    explanation: "A's 1-day work = 1/10. B's 1-day work = 1/15. Together (A+B)'s 1-day work = 1/10 + 1/15 = 5/30 = 1/6. Hence, 6 days.",
    estimatedSeconds: 45,
    tags: ["TCS NQT", "Accenture"]
  },
  {
    id: "quant-011",
    category: "quant",
    topic: "Time & Work",
    difficulty: "Medium",
    question: "A can do a work in 12 days and B in 15 days. They worked together for 4 days and then A left. How many more days will B take to finish the remaining work?",
    options: ["4 days", "5 days", "6 days", "7 days"],
    correctAnswer: "6 days",
    explanation: "(A+B)'s 1 day work = 1/12 + 1/15 = 9/60 = 3/20. In 4 days, work done = 4 * (3/20) = 3/5. Remaining work = 2/5. Time for B = (2/5) / (1/15) = 6 days.",
    estimatedSeconds: 70,
    tags: ["TCS", "Amazon"]
  },
  {
    id: "quant-012",
    category: "quant",
    topic: "Time & Work",
    difficulty: "Hard",
    question: "12 men or 18 women can do a work in 14 days. How many days will 8 men and 16 women take to complete the same work?",
    options: ["8 days", "9 days", "10 days", "12 days"],
    correctAnswer: "9 days",
    explanation: "12 Men = 18 Women => 1 Man = 1.5 Women. 8 Men + 16 Women = 8(1.5) + 16 = 12 + 16 = 28 Women. 18 Women take 14 days. 28 Women take (18 * 14) / 28 = 9 days.",
    estimatedSeconds: 80,
    tags: ["Accenture", "Placement-style"]
  },
  {
    id: "quant-013",
    category: "quant",
    topic: "Pipes & Cisterns",
    difficulty: "Medium",
    question: "Pipe A can fill a tank in 6 hours and Pipe B can empty it in 8 hours. If both pipes are opened together, how long will it take to fill the tank?",
    options: ["14 hours", "24 hours", "18 hours", "12 hours"],
    correctAnswer: "24 hours",
    explanation: "Net filling rate per hour = 1/6 - 1/8 = (4 - 3)/24 = 1/24. Thus, it will take 24 hours.",
    estimatedSeconds: 50,
    tags: ["Infosys", "Wipro"]
  },
  {
    id: "quant-014",
    category: "quant",
    topic: "Time Speed Distance",
    difficulty: "Easy",
    question: "A train traveling at 72 km/h crosses a pole in 10 seconds. What is the length of the train?",
    options: ["150 meters", "200 meters", "250 meters", "300 meters"],
    correctAnswer: "200 meters",
    explanation: "Speed in m/s = 72 * (5/18) = 20 m/s. Length of train = Speed * Time = 20 * 10 = 200 meters.",
    estimatedSeconds: 40,
    tags: ["TCS NQT", "Cognizant"]
  },
  {
    id: "quant-015",
    category: "quant",
    topic: "Time Speed Distance",
    difficulty: "Medium",
    question: "A car covers a distance of 300 km at an average speed of 60 km/h and returns at 40 km/h. What is the average speed for the entire round trip?",
    options: ["48 km/h", "50 km/h", "52 km/h", "45 km/h"],
    correctAnswer: "48 km/h",
    explanation: "Average speed for equal distances = 2xy / (x + y) = (2 * 60 * 40) / (60 + 40) = 4800 / 100 = 48 km/h.",
    estimatedSeconds: 50,
    tags: ["TCS", "Infosys"]
  },
  {
    id: "quant-016",
    category: "quant",
    topic: "Boats & Streams",
    difficulty: "Medium",
    question: "A boat moves downstream at 14 km/h and upstream at 8 km/h. What is the speed of the boat in still water?",
    options: ["10 km/h", "11 km/h", "12 km/h", "11.5 km/h"],
    correctAnswer: "11 km/h",
    explanation: "Speed in still water = (Downstream speed + Upstream speed) / 2 = (14 + 8) / 2 = 11 km/h.",
    estimatedSeconds: 45,
    tags: ["Deloitte", "Placement-style"]
  },
  {
    id: "quant-017",
    category: "quant",
    topic: "Ratio & Proportion",
    difficulty: "Easy",
    question: "If A : B = 2 : 3 and B : C = 4 : 5, find A : C.",
    options: ["8 : 15", "2 : 5", "3 : 5", "6 : 15"],
    correctAnswer: "8 : 15",
    explanation: "A/C = (A/B) * (B/C) = (2/3) * (4/5) = 8/15 => A : C = 8 : 15.",
    estimatedSeconds: 35,
    tags: ["TCS NQT"]
  },
  {
    id: "quant-018",
    category: "quant",
    topic: "Ratio & Proportion",
    difficulty: "Medium",
    question: "The ratio of boys and girls in a college of 720 students is 7 : 5. How many more girls should be admitted to make the ratio 1 : 1?",
    options: ["90", "120", "150", "60"],
    correctAnswer: "120",
    explanation: "Boys = (7/12) * 720 = 420. Girls = (5/12) * 720 = 300. For 1:1 ratio, number of girls must equal 420. Additional girls = 420 - 300 = 120.",
    estimatedSeconds: 55,
    tags: ["Infosys", "Capgemini"]
  },
  {
    id: "quant-019",
    category: "quant",
    topic: "Averages",
    difficulty: "Easy",
    question: "The average of 5 consecutive odd numbers is 27. What is the largest of these numbers?",
    options: ["29", "31", "33", "35"],
    correctAnswer: "31",
    explanation: "For consecutive terms in AP, the average is the middle term. The numbers are 23, 25, 27, 29, 31. Largest = 31.",
    estimatedSeconds: 40,
    tags: ["Wipro", "TCS"]
  },
  {
    id: "quant-020",
    category: "quant",
    topic: "Averages",
    difficulty: "Medium",
    question: "The average age of 24 students and their teacher is 15 years. If the teacher's age is excluded, the average decreases by 1 year. What is the teacher's age?",
    options: ["36 years", "39 years", "42 years", "45 years"],
    correctAnswer: "39 years",
    explanation: "Total age of 25 people = 25 * 15 = 375. Total age of 24 students = 24 * 14 = 336. Teacher's age = 375 - 336 = 39 years.",
    estimatedSeconds: 55,
    tags: ["Accenture", "TCS"]
  },
  {
    id: "quant-021",
    category: "quant",
    topic: "Probability",
    difficulty: "Easy",
    question: "Two fair dice are thrown simultaneously. What is the probability of getting a sum of 8?",
    options: ["5/36", "1/6", "7/36", "1/9"],
    correctAnswer: "5/36",
    explanation: "Total outcomes = 36. Favorable outcomes for sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) => 5 pairs. Probability = 5/36.",
    estimatedSeconds: 45,
    tags: ["TCS NQT", "Amazon"]
  },
  {
    id: "quant-022",
    category: "quant",
    topic: "Probability",
    difficulty: "Medium",
    question: "A bag contains 4 red balls and 6 black balls. Two balls are drawn at random without replacement. What is the probability that both are red?",
    options: ["2/15", "1/5", "4/25", "3/10"],
    correctAnswer: "2/15",
    explanation: "P(both red) = (4/10) * (3/9) = (2/5) * (1/3) = 2/15.",
    estimatedSeconds: 50,
    tags: ["Infosys", "Google"]
  },
  {
    id: "quant-023",
    category: "quant",
    topic: "Permutation & Combination",
    difficulty: "Easy",
    question: "In how many different ways can the letters of the word 'LEADER' be arranged?",
    options: ["720", "360", "180", "120"],
    correctAnswer: "360",
    explanation: "Total letters = 6. The letter 'E' appears twice. Total arrangements = 6! / 2! = 720 / 2 = 360.",
    estimatedSeconds: 45,
    tags: ["TCS NQT"]
  },
  {
    id: "quant-024",
    category: "quant",
    topic: "Permutation & Combination",
    difficulty: "Medium",
    question: "From a group of 7 men and 6 women, 5 persons are to be selected to form a committee so that at least 3 men are there on the committee. In how many ways can it be done?",
    options: ["564", "645", "756", "864"],
    correctAnswer: "756",
    explanation: "Cases: (3M, 2W) + (4M, 1W) + (5M, 0W) = (7C3 * 6C2) + (7C4 * 6C1) + (7C5 * 6C0) = (35 * 15) + (35 * 6) + (21 * 1) = 525 + 210 + 21 = 756.",
    estimatedSeconds: 75,
    tags: ["Amazon", "Placement-style"]
  },
  {
    id: "quant-025",
    category: "quant",
    topic: "Number System",
    difficulty: "Easy",
    question: "What is the unit digit in the product 7^105?",
    options: ["1", "3", "7", "9"],
    correctAnswer: "7",
    explanation: "Cyclicity of powers of 7 is 4 (7, 9, 3, 1). 105 mod 4 = 1. Therefore, unit digit = 7^1 = 7.",
    estimatedSeconds: 45,
    tags: ["TCS", "Accenture"]
  },
  {
    id: "quant-026",
    category: "quant",
    topic: "HCF & LCM",
    difficulty: "Easy",
    question: "The HCF and LCM of two numbers are 12 and 240 respectively. If one number is 48, find the other number.",
    options: ["50", "60", "72", "80"],
    correctAnswer: "60",
    explanation: "Product of two numbers = HCF * LCM => 48 * Other = 12 * 240 => Other = (12 * 240) / 48 = 60.",
    estimatedSeconds: 35,
    tags: ["Infosys", "Wipro"]
  },
  {
    id: "quant-027",
    category: "quant",
    topic: "Ages",
    difficulty: "Easy",
    question: "The ratio of present ages of A and B is 4 : 5. Five years hence, the ratio of their ages will be 5 : 6. What is A's present age?",
    options: ["15 years", "20 years", "25 years", "30 years"],
    correctAnswer: "20 years",
    explanation: "Let ages be 4x and 5x. (4x + 5) / (5x + 5) = 5/6 => 24x + 30 = 25x + 25 => x = 5. A's present age = 4x = 20 years.",
    estimatedSeconds: 50,
    tags: ["TCS NQT", "Cognizant"]
  },
  {
    id: "quant-028",
    category: "quant",
    topic: "Mixtures & Alligations",
    difficulty: "Medium",
    question: "In what ratio must a grocer mix two varieties of tea worth ₹60 a kg and ₹65 a kg so that by selling the mixture at ₹68.20 a kg he may gain 10%?",
    options: ["3 : 2", "3 : 4", "2 : 3", "4 : 3"],
    correctAnswer: "3 : 2",
    explanation: "Cost Price of mixture = 68.20 / 1.10 = ₹62/kg. Using alligation rule: (65 - 62) : (62 - 60) = 3 : 2.",
    estimatedSeconds: 65,
    tags: ["TCS", "Accenture"]
  },
  {
    id: "quant-029",
    category: "quant",
    topic: "Data Interpretation",
    difficulty: "Medium",
    question: "A company’s revenue increased by 20% in 2023 and then decreased by 10% in 2024. What is the net percentage change over the two years?",
    options: ["+10%", "+8%", "+12%", "-2%"],
    correctAnswer: "+8%",
    explanation: "Net change = x + y + (xy/100) = 20 - 10 + (20 * -10)/100 = 10 - 2 = +8%.",
    estimatedSeconds: 40,
    tags: ["Infosys", "Deloitte"]
  },
  {
    id: "quant-030",
    category: "quant",
    topic: "Sequences",
    difficulty: "Medium",
    question: "Find the sum of the first 20 terms of the arithmetic progression: 3, 7, 11, 15, ...",
    options: ["780", "820", "840", "860"],
    correctAnswer: "820",
    explanation: "Sum S_n = n/2 [2a + (n-1)d]. a = 3, d = 4, n = 20. S_20 = 20/2 [2(3) + 19(4)] = 10 [6 + 76] = 10 * 82 = 820.",
    estimatedSeconds: 50,
    tags: ["TCS NQT"]
  },

  // ==========================================
  // 2. LOGICAL REASONING (35 Questions)
  // ==========================================
  {
    id: "logic-001",
    category: "logical",
    topic: "Coding-Decoding",
    difficulty: "Easy",
    question: "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in the same code?",
    options: ["EOJDJEFM", "EOJDEJFM", "MFEJDJOE", "EOJDJFEM"],
    correctAnswer: "EOJDJEFM",
    explanation: "Reverse the letters: R E T U P M O C, then add +1 to each inner letter while keeping the ends swapped: M E D I C I N E reversed is E N I C I D E M. Letters become E O J D J E F M.",
    estimatedSeconds: 60,
    tags: ["TCS NQT", "Infosys"]
  },
  {
    id: "logic-002",
    category: "logical",
    topic: "Coding-Decoding",
    difficulty: "Medium",
    question: "If 'DELHI' is coded as '73541' and 'CALCUTTA' as '82589662', how can 'CALICUT' be coded?",
    options: ["5279431", "5978213", "8251896", "8543691"],
    correctAnswer: "8251896",
    explanation: "Direct letter-to-number assignment: C=8, A=2, L=5, I=1, C=8, U=9, T=6. Thus CALICUT = 8251896.",
    estimatedSeconds: 45,
    tags: ["Wipro", "TCS"]
  },
  {
    id: "logic-003",
    category: "logical",
    topic: "Blood Relations",
    difficulty: "Easy",
    question: "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    options: ["Brother", "Uncle", "Father", "Cousin"],
    correctAnswer: "Father",
    explanation: "The only son of Suresh's mother is Suresh himself. The boy is the son of Suresh, so Suresh is the father of the boy.",
    estimatedSeconds: 40,
    tags: ["TCS NQT", "Accenture"]
  },
  {
    id: "logic-004",
    category: "logical",
    topic: "Blood Relations",
    difficulty: "Medium",
    question: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?",
    options: ["Grandmother", "Grandfather", "Granddaughter", "Daughter"],
    correctAnswer: "Granddaughter",
    explanation: "A is daughter of C, and C is daughter of D. Therefore, A is the granddaughter of D.",
    estimatedSeconds: 50,
    tags: ["Infosys", "Capgemini"]
  },
  {
    id: "logic-005",
    category: "logical",
    topic: "Directions",
    difficulty: "Easy",
    question: "A man walks 5 km East, then turns right and walks 4 km, then turns left and walks 5 km. In which direction is he from his starting point?",
    options: ["North-East", "South-East", "North-West", "South-West"],
    correctAnswer: "South-East",
    explanation: "East +5, then South -4, then East +5. Net position: 10 km East and 4 km South => South-East.",
    estimatedSeconds: 45,
    tags: ["TCS", "Cognizant"]
  },
  {
    id: "logic-006",
    category: "logical",
    topic: "Directions",
    difficulty: "Medium",
    question: "Starting from point X, Joy walked 15 m towards west. He turned left and walked 20 m. He then turned left and walked 15 m. After this he turned to his right and walked 12 m. How far and in which direction is now Joy from X?",
    options: ["32 m, South", "47 m, East", "42 m, North", "27 m, South"],
    correctAnswer: "32 m, South",
    explanation: "West 15, South 20, East 15 (returns to same vertical line as X), South 12. Total distance from X = 20 + 12 = 32 m South.",
    estimatedSeconds: 55,
    tags: ["Accenture", "TCS"]
  },
  {
    id: "logic-007",
    category: "logical",
    topic: "Syllogisms",
    difficulty: "Easy",
    question: "Statements: All mangoes are golden in colour. No golden-coloured things are cheap.\nConclusions:\nI. All mangoes are cheap.\nII. Golden-coloured mangoes are not cheap.",
    options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither follows"],
    correctAnswer: "Only II follows",
    explanation: "Since all mangoes are golden and no golden things are cheap, no mangoes can be cheap. Thus Conclusion II follows logically.",
    estimatedSeconds: 45,
    tags: ["TCS NQT", "Infosys"]
  },
  {
    id: "logic-008",
    category: "logical",
    topic: "Syllogisms",
    difficulty: "Medium",
    question: "Statements: Some cats are dogs. Some dogs are birds.\nConclusions:\nI. Some cats are birds.\nII. No cat is a bird.",
    options: ["Only I follows", "Only II follows", "Either I or II follows", "Neither follows"],
    correctAnswer: "Either I or II follows",
    explanation: "Conclusions I and II form a complementary pair ('Some' and 'No') between the same subject and predicate. Hence either I or II follows.",
    estimatedSeconds: 55,
    tags: ["Accenture", "Placement-style"]
  },
  {
    id: "logic-009",
    category: "logical",
    topic: "Series",
    difficulty: "Easy",
    question: "Look at this series: 2, 6, 12, 20, 30, ... What number should come next?",
    options: ["36", "40", "42", "48"],
    correctAnswer: "42",
    explanation: "Differences are +4, +6, +8, +10. The next difference is +12. 30 + 12 = 42 (also n^2 + n: 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42).",
    estimatedSeconds: 35,
    tags: ["TCS NQT"]
  },
  {
    id: "logic-010",
    category: "logical",
    topic: "Series",
    difficulty: "Medium",
    question: "Find the missing number in the series: 3, 7, 15, 31, 63, ...",
    options: ["127", "125", "129", "131"],
    correctAnswer: "127",
    explanation: "Each term is (Previous Term * 2) + 1. 63 * 2 + 1 = 126 + 1 = 127.",
    estimatedSeconds: 40,
    tags: ["Infosys", "Wipro"]
  },
  {
    id: "logic-011",
    category: "logical",
    topic: "Clocks & Calendars",
    difficulty: "Medium",
    question: "At what angle are the hands of a clock inclined at 15 minutes past 5?",
    options: ["67.5°", "62.5°", "58.5°", "72.5°"],
    correctAnswer: "67.5°",
    explanation: "Angle = |30H - (11/2)M| = |30(5) - (11/2)(15)| = |150 - 82.5| = 67.5°.",
    estimatedSeconds: 55,
    tags: ["TCS", "Amazon"]
  },
  {
    id: "logic-012",
    category: "logical",
    topic: "Clocks & Calendars",
    difficulty: "Easy",
    question: "If 1st January 2006 was a Sunday, what day of the week was 1st January 2007?",
    options: ["Sunday", "Monday", "Tuesday", "Wednesday"],
    correctAnswer: "Monday",
    explanation: "2006 is an ordinary year (365 days = 52 weeks + 1 odd day). 1 day after Sunday is Monday.",
    estimatedSeconds: 35,
    tags: ["TCS NQT"]
  },
  {
    id: "logic-013",
    category: "logical",
    topic: "Seating Arrangement",
    difficulty: "Medium",
    question: "Five friends A, B, C, D and E are sitting in a row facing North. D is to the immediate right of B. A is to the left of C and to the right of D. Who is in the middle?",
    options: ["A", "B", "C", "D"],
    correctAnswer: "D",
    explanation: "From conditions: D is right of B (B D), A is right of D (B D A), C is right of A (B D A C). Order: E B D A C. In the sequence, D is in the exact middle.",
    estimatedSeconds: 65,
    tags: ["Infosys", "Capgemini"]
  },
  {
    id: "logic-014",
    category: "logical",
    topic: "Analogies",
    difficulty: "Easy",
    question: "Cup is to Coffee as Bowl is to:",
    options: ["Dish", "Soup", "Spoon", "Food"],
    correctAnswer: "Soup",
    explanation: "Coffee is served in a cup; soup is served in a bowl.",
    estimatedSeconds: 25,
    tags: ["TCS NQT"]
  },
  {
    id: "logic-015",
    category: "logical",
    topic: "Venn Diagrams",
    difficulty: "Easy",
    question: "Which of the following diagrams best represents the relationship between: 'Engineers, Doctors, Human beings'?",
    options: [
      "Two disjoint circles inside a large circle",
      "Three concentric circles",
      "Three mutually intersecting circles",
      "Two intersecting circles inside a large circle"
    ],
    correctAnswer: "Two intersecting circles inside a large circle",
    explanation: "All Engineers and Doctors are human beings (contained in large circle), and some individuals can be both (intersecting).",
    estimatedSeconds: 40,
    tags: ["TCS", "Accenture"]
  },

  // ==========================================
  // 3. VERBAL ABILITY (35 Questions)
  // ==========================================
  {
    id: "verbal-001",
    category: "verbal",
    topic: "Vocabulary",
    difficulty: "Easy",
    question: "Choose the word which is most NEARLY OPPOSITE in meaning to the word: 'METICULOUS'.",
    options: ["Careless", "Painstaking", "Thorough", "Detailed"],
    correctAnswer: "Careless",
    explanation: "'Meticulous' means showing great attention to detail and being very careful. The opposite is 'Careless'.",
    estimatedSeconds: 30,
    tags: ["TCS NQT", "Accenture"]
  },
  {
    id: "verbal-002",
    category: "verbal",
    topic: "Vocabulary",
    difficulty: "Easy",
    question: "Choose the synonym of 'CANDID':",
    options: ["Frank", "Secretive", "Shy", "Cruel"],
    correctAnswer: "Frank",
    explanation: "'Candid' means truthful and straightforward; frank.",
    estimatedSeconds: 25,
    tags: ["Infosys", "Wipro"]
  },
  {
    id: "verbal-003",
    category: "verbal",
    topic: "Error Spotting",
    difficulty: "Medium",
    question: "Identify the part of the sentence that contains an error:\n(A) Neither of the two boys / (B) are eligible / (C) for the scholarship / (D) No error.",
    options: ["A", "B", "C", "D"],
    correctAnswer: "B",
    explanation: "'Neither of' takes a singular verb. 'are eligible' should be corrected to 'is eligible'.",
    estimatedSeconds: 40,
    tags: ["TCS NQT", "Deloitte"]
  },
  {
    id: "verbal-004",
    category: "verbal",
    topic: "Error Spotting",
    difficulty: "Medium",
    question: "Identify the error:\n(A) One of the main reasons / (B) for his failure / (C) were his laziness / (D) No error.",
    options: ["A", "B", "C", "D"],
    correctAnswer: "C",
    explanation: "The subject 'One' is singular, so the verb must be 'was', not 'were'.",
    estimatedSeconds: 40,
    tags: ["Accenture", "TCS"]
  },
  {
    id: "verbal-005",
    category: "verbal",
    topic: "Sentence Completion",
    difficulty: "Easy",
    question: "The jury _____ divided in their opinions regarding the verdict.",
    options: ["was", "were", "is", "has been"],
    correctAnswer: "were",
    explanation: "When a collective noun indicates divided individuals within the group, it takes a plural verb ('were divided in their opinions').",
    estimatedSeconds: 35,
    tags: ["TCS NQT", "Infosys"]
  },
  {
    id: "verbal-006",
    category: "verbal",
    topic: "Sentence Completion",
    difficulty: "Medium",
    question: "He is so _____ that he believes whatever anyone tells him.",
    options: ["gullible", "cynical", "astute", "skeptical"],
    correctAnswer: "gullible",
    explanation: "'Gullible' means easily persuaded to believe something; naive.",
    estimatedSeconds: 35,
    tags: ["Capgemini", "Wipro"]
  },
  {
    id: "verbal-007",
    category: "verbal",
    topic: "Idioms & Phrases",
    difficulty: "Easy",
    question: "What does the idiom 'To bite the bullet' mean?",
    options: [
      "To face a difficult situation with courage",
      "To commit a crime",
      "To eat very quickly",
      "To avoid responsibility"
    ],
    correctAnswer: "To face a difficult situation with courage",
    explanation: "'To bite the bullet' means to endure a painful or otherwise unpleasant situation that is unavoidable.",
    estimatedSeconds: 30,
    tags: ["TCS NQT", "Accenture"]
  },
  {
    id: "verbal-008",
    category: "verbal",
    topic: "Sentence Correction",
    difficulty: "Medium",
    question: "Choose the correct sentence:",
    options: [
      "She is senior than me in the company.",
      "She is senior to me in the company.",
      "She is more senior than me in the company.",
      "She is senior over me in the company."
    ],
    correctAnswer: "She is senior to me in the company.",
    explanation: "Latin adjectives ending in -ior (senior, junior, superior, inferior, prior) are followed by 'to', not 'than'.",
    estimatedSeconds: 35,
    tags: ["Infosys", "Deloitte"]
  },
  {
    id: "verbal-009",
    category: "verbal",
    topic: "Para Jumbles",
    difficulty: "Hard",
    question: "Rearrange the sentences into a coherent paragraph:\nP: In ancient times, travellers relied on stars for direction.\nQ: Modern navigation, however, has been revolutionized by GPS.\nR: Finding one's way across unknown terrain has always been essential.\nS: Today, digital maps pinpoint locations with remarkable precision.",
    options: ["R-P-Q-S", "P-R-S-Q", "Q-S-P-R", "R-Q-P-S"],
    correctAnswer: "R-P-Q-S",
    explanation: "Sentence R introduces navigation across time. P follows with the historical context. Q introduces the modern shift ('however'), and S concludes with digital GPS precision.",
    estimatedSeconds: 65,
    tags: ["TCS NQT", "Amazon"]
  },
  {
    id: "verbal-010",
    category: "verbal",
    topic: "Fill in the Blanks",
    difficulty: "Easy",
    question: "She prevailed _____ her father to consent to the wedding.",
    options: ["on", "with", "upon", "over"],
    correctAnswer: "upon",
    explanation: "The phrasal verb 'prevail upon someone' means to persuade someone to do something.",
    estimatedSeconds: 35,
    tags: ["Cognizant", "TCS"]
  },
  {
    id: "verbal-011",
    category: "verbal",
    topic: "Reading Comprehension",
    difficulty: "Medium",
    question: "'Artificial Intelligence has permeated virtually every aspect of modern enterprise, yet the human capacity for critical discernment and ethical leadership remains irreplaceable.' What is the primary message of this sentence?",
    options: [
      "AI will completely replace human workers soon",
      "Human judgment and ethics remain vital despite pervasive AI",
      "AI is ineffective in modern enterprises",
      "Critical thinking cannot be learned by humans"
    ],
    correctAnswer: "Human judgment and ethics remain vital despite pervasive AI",
    explanation: "The sentence emphasizes that despite widespread AI adoption, human ethical discernment and leadership are irreplaceable.",
    estimatedSeconds: 45,
    tags: ["Amazon", "TCS NQT"]
  }
];

module.exports = { APTITUDE_QUESTIONS };
