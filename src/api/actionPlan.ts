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
export async function createActionPlan(data) {
    return await addDoc(collection(db, "ActionPlan"), { ...data, createdAt: serverTimestamp() });
}

export async function getActionPlanByPlayer() {
  const collectionRef = collection(db, "ActionPlan");
  try {
    const querySnapshot = await getDocs(collectionRef);
    let filteredDocs: any[] = [];
    querySnapshot.forEach((doc) => {
      filteredDocs.push({ ...doc.data() });
    });
    return filteredDocs;
  } catch (error) {
    console.error("Error filtering documents:", error);
    return [];
  }

}