import { db, serverTimestamp } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc
} from "firebase/firestore";

/**
 * Create or overwrite a user doc with a specific ID (U001 style)
 * use setDoc for deterministic IDs
 */
export async function createDailyCompletion(data) {
    return await addDoc(collection(db, "DailyCompletion"), { ...data, createdAt: serverTimestamp() });
}
export async function updateDailyCompletion(id, data) {
  await updateDoc(doc(db, "DailyCompletion", id), data);
  return true;
}
export async function getDailyCompletionByPlayer(userId, date) {
    const today = new Date().toISOString().split('T')[0];
  const collectionRef = collection(db, "DailyCompletion");
  const q = query(
    collectionRef,
    where("playerId" as string, "==", userId),
    where("date" as string, "==", date),
  );
  try {
    const querySnapshot = await getDocs(q);
    let filteredDocs: any[] = [];
    querySnapshot.forEach((doc) => {
      filteredDocs.push({ id : doc.id, ...doc.data() });
    });
    return filteredDocs;
  } catch (error) {
    console.error("Error filtering documents:", error);
    return [];
  }

}