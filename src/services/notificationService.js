import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  deleteDoc,
  doc 
} from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  /**
   * Send a global notification (Admin only)
   */
  async sendBroadcast(data) {
    try {
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        title: data.title,
        message: data.message,
        type: data.type || 'info', // info, warning, success
        createdAt: serverTimestamp(),
        authorId: data.authorId || 'admin'
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error("Error sending broadcast:", error);
      throw error;
    }
  },

  /**
   * Get recent notifications
   */
  async getRecentNotifications(limitCount = 10) {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  },

  /**
   * Delete a notification (Admin only)
   */
  async deleteNotification(id) {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
};
