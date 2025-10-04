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
  orderBy,
  addDoc
} from "firebase/firestore";

/**
 * Create or overwrite a user doc with a specific ID (U001 style)
 * use setDoc for deterministic IDs
 */
export async function createQuestion(data) {
    return await addDoc(collection(db, "assessments"), { ...data, createdAt: serverTimestamp() });
}

export async function getAllQuestions() {
  const q = query(collection(db, "assessments"), orderBy("order", "asc"));
  const snap = await getDocs(q);
    let filteredDocs: any[] = [];
    snap.forEach((doc) => {
      filteredDocs.push({ id: doc.id, ...doc.data() });
    });
    return filteredDocs.sort((a, b) => parseInt(a.order) - parseInt(b.order));
}
 
