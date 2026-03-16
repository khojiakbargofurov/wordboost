import { collection, getDocs, query, orderBy, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const WORDS_JSON_PATH = '/data/words.json';

// Helper to fetch words from local JSON
async function fetchLocalWords() {
  try {
    const response = await fetch(WORDS_JSON_PATH);
    if (!response.ok) throw new Error('Failed to fetch words.json');
    return await response.json();
  } catch (error) {
    console.error("Error fetching local words:", error);
    return [];
  }
}

export const wordService = {
  // Fetch all words from local JSON
  async getAllWords() {
    try {
      const words = await fetchLocalWords();
      // Sort alphabetically by word name
      return words.sort((a, b) => a.word.localeCompare(b.word));
    } catch (error) {
      console.error("Error in getAllWords:", error);
      return [];
    }
  },

  // Get daily 50 words for a user
  // This now uses local JSON for the word list and Firestore only for user progress
  async getDailyWords(userId, userLevel = 'A1') {
    try {
      // 1. Fetch user data from Firestore (minimal reads)
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      const learnedWords = userData.learnedWords || [];
      const today = new Date().toISOString().split('T')[0];
      
      // 2. Load all vocabulary from JSON (cached by browser, 0 Firestore reads)
      const allWords = await fetchLocalWords();

      // 3. If daily words already assigned for today, return them (filtered against learned)
      if (userData.lastDailyReviewDate === today && userData.dailyWords && userData.dailyWords.length > 0) {
        const assignedWords = allWords.filter(w => 
          userData.dailyWords.includes(w.id) && !learnedWords.includes(w.id)
        );
        if (assignedWords.length > 0) return assignedWords;
      }

      // 4. Otherwise, pick new 50 words from the level
      let levelWords = allWords.filter(w => w.level === userLevel);
      
      // Fallback if no level match
      if (levelWords.length === 0) levelWords = allWords;

      // Filter out already learned words
      const availableWords = levelWords.filter(w => !learnedWords.includes(w.id));
      
      // Shuffle and pick 50
      const selectedWords = availableWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 50);
      
      // 5. Save the selected IDs for today to Firestore
      await setDoc(userRef, {
        lastDailyReviewDate: today,
        dailyWords: selectedWords.map(w => w.id)
      }, { merge: true });
      
      return selectedWords;
    } catch (error) {
      console.error("Error in getDailyWords:", error);
      return [];
    }
  },

  // Fetch leaderboard: top users sorted by XP
  async getLeaderboard(limit = 20) {
    try {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'));
      const snap = await getDocs(q);
      const users = snap.docs.map((d, idx) => ({
        id: d.id,
        name: d.data().displayName || d.data().email?.split('@')[0] || 'Foydalanuvchi',
        xp: d.data().xp || 0,
        avatar: (d.data().displayName || d.data().email || 'U')
          .trim()
          .split(' ')
          .slice(0, 2)
          .map(n => n[0]?.toUpperCase() || '')
          .join(''),
        rank: idx + 1,
      }));
      return users.slice(0, limit);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  },

  // Save quiz session results: adds XP, updates streak
  async saveQuizResult(userId, { correctCount, learnedWordIds = [] }) {
    try {
      const xpEarned = correctCount * 10;
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data() || {};

      const today = new Date().toISOString().split('T')[0];
      const lastActive = data.lastActiveDate || '';
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const newStreak = lastActive === today
        ? (data.streak || 0)
        : lastActive === yesterday
        ? (data.streak || 0) + 1
        : 1;

      const existingLearned = data.learnedWords || [];
      const newLearned = [...new Set([...existingLearned, ...learnedWordIds])];

      await setDoc(userRef, {
        xp: (data.xp || 0) + xpEarned,
        streak: newStreak,
        lastActiveDate: today,
        learnedWords: newLearned,
        totalQuizzesCompleted: (data.totalQuizzesCompleted || 0) + 1,
        totalCorrectAnswers: (data.totalCorrectAnswers || 0) + correctCount,
      }, { merge: true });

      return { xpEarned, newStreak };
    } catch (error) {
      console.error('Error saving quiz result:', error);
      return { xpEarned: 0 };
    }
  },

  // Save flashcard session: marks words as learned, adds XP, updates streak
  async saveFlashcardSession(userId, { wordIds = [], easyCount = 0, mediumCount = 0 }) {
    try {
      const xpEarned = easyCount * 15 + mediumCount * 8;
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data() || {};

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const lastActive = data.lastActiveDate || '';
      
      const newStreak = lastActive === today
        ? (data.streak || 0)
        : lastActive === yesterday
        ? (data.streak || 0) + 1
        : 1;

      const existingLearned = data.learnedWords || [];
      const newLearned = [...new Set([...existingLearned, ...wordIds])];

      await setDoc(userRef, {
        xp: (data.xp || 0) + xpEarned,
        streak: newStreak,
        lastActiveDate: today,
        learnedWords: newLearned,
        totalFlashcardsReviewed: (data.totalFlashcardsReviewed || 0) + wordIds.length,
      }, { merge: true });

      return { xpEarned, newStreak };
    } catch (error) {
      console.error('Error saving flashcard session:', error);
      return { xpEarned: 0 };
    }
  },

  // Quiz progress persistence
  async saveQuizProgress(userId, progress) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        quizProgress: {
          ...progress,
          lastUpdated: serverTimestamp(),
          date: new Date().toISOString().split('T')[0]
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  },

  async getQuizProgress(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return null;
      
      const data = snap.data();
      const progress = data.quizProgress;
      if (!progress) return null;
      
      const today = new Date().toISOString().split('T')[0];
      if (progress.date !== today) return null;
      
      return progress;
    } catch (error) {
      console.error('Error fetching quiz progress:', error);
      return null;
    }
  },

  async clearQuizProgress(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        quizProgress: null
      }, { merge: true });
    } catch (error) {
      console.error('Error clearing quiz progress:', error);
    }
  }
};
