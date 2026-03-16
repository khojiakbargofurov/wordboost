import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, getDoc, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';

const WORDS_COLLECTION = 'words';

export const wordService = {
  // Fetch all words
  async getAllWords() {
    try {
      const q = query(collection(db, WORDS_COLLECTION), orderBy('word', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching words:", error);
      throw error;
    }
  },

  // Get daily 50 words for a user
  async getDailyWords(userId, userLevel = 'A1') {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      
      const today = new Date().toISOString().split('T')[0];
      
      // If daily words already assigned for today, return them (but filter out any learned since then)
      if (userData.lastDailyReviewDate === today && userData.dailyWords && userData.dailyWords.length > 0) {
        const learnedWords = userData.learnedWords || [];
        
        // Fetch specific daily words based on IDs
        const q = query(collection(db, WORDS_COLLECTION));
        const allWordsSnap = await getDocs(q);
        const assignedWords = allWordsSnap.docs
          .filter(doc => userData.dailyWords.includes(doc.id) && !learnedWords.includes(doc.id))
          .map(doc => ({ id: doc.id, ...doc.data() }));
          
        if (assignedWords.length > 0) return assignedWords;
      }

      // Otherwise, pick new 50 words
      const q = query(
        collection(db, WORDS_COLLECTION),
        where("level", "==", userLevel)
      );
      const levelWordsSnap = await getDocs(q);
      let levelWords = levelWordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fallback to all words if no level match
      if (levelWords.length === 0) {
         const allQ = query(collection(db, WORDS_COLLECTION));
         const allSnap = await getDocs(allQ);
         levelWords = allSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      const learnedWords = userData.learnedWords || [];
      const availableWords = levelWords.filter(w => !learnedWords.includes(w.id));
      
      // Shuffle and pick 50
      const shuffled = availableWords.sort(() => 0.5 - Math.random());
      const selectedWords = shuffled.slice(0, 50);
      
      // Save for today using setDoc with merge to ensure doc creation if missing
      await setDoc(userRef, {
        lastDailyReviewDate: today,
        dailyWords: selectedWords.map(w => w.id)
      }, { merge: true });
      
      return selectedWords;
    } catch (error) {
      console.error("Error fetching daily words:", error);
      throw error;
    }
  },

  // Add a new word
  async addWord(wordData) {
    try {
      const docRef = await addDoc(collection(db, WORDS_COLLECTION), {
        ...wordData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...wordData };
    } catch (error) {
      console.error("Error adding word:", error);
      throw error;
    }
  },

  // Fetch leaderboard: top users sorted by XP
  async getLeaderboard(limit = 20) {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('xp', 'desc')
      );
      const snap = await getDocs(q);
      const users = snap.docs.map((d, idx) => ({
        id: d.id,
        name: d.data().displayName || d.data().email?.split('@')[0] || 'Foydalanuvchi',
        xp: d.data().xp || 0,
        avatar: (d.data().displayName || d.data().email || 'U')
          .replace(/\s+/g, ' ')
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
        ? (data.streak || 0)                         // already active today
        : lastActive === yesterday
        ? (data.streak || 0) + 1                     // extend streak
        : 1;                                         // streak reset

      // Merge newly learned words
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

      // Merge newly learned word IDs (easy = mastered)
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
      
      // Only return if it's from today
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
