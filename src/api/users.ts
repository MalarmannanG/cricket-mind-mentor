// src/api/users.js
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
export async function createUser(data) {
  // const ref = doc(db, "users", userId);
  // await setDoc(ref, { ...data, createdAt: serverTimestamp() }, { merge: true });
  // return userId;
  const user = await getUserByEmail(data.email);
  if (user) {
    return null; // User already exists
  } else {
    return await addDoc(collection(db, "users"), { ...data, createdAt: serverTimestamp() });
  }

}

export async function getUserAll() {
  const collectionRef = collection(db, "users");
   const q = query(
    collectionRef,
    where("role" as string, "==", "player")
  );
  const snap = await getDocs(q);
    let filteredDocs: any[] = [];
    snap.forEach((doc) => {
      filteredDocs.push({ id: doc.id, ...doc.data() });
    });
    return filteredDocs;
}

export async function getUser(userId) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function getUserByEmail(userId) {
  const collectionRef = collection(db, "users");
  const q = query(
    collectionRef,
    where("email" as string, "==", userId)
  );
  try {
    const querySnapshot = await getDocs(q);
    let filteredDocs: any;
    querySnapshot.forEach((doc) => {
      filteredDocs = ({ id: doc.id, ...doc.data() });
    });
    return filteredDocs;
  } catch (error) {
    console.error("Error filtering documents:", error);
    return [];
  }
  //return snap.size > 0 ? { ...snap } : null;
}
export async function updateUser(userId, updates) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, updates);
  return true;
}

export async function deleteUser(userId) {
  await deleteDoc(doc(db, "users", userId));
  return true;
}

/**
 * List all users in a team (players). Use teamId field on users.
 */
export async function listUsersByTeam(teamId) {
  const q = query(collection(db, "users"), where("teamId", "==", teamId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Real-time subscription to players in a team
 * callback receives array of user objects
 * returns unsubscribe function
 */
export function subscribeUsersByTeam(teamId, callback) {
  const q = query(collection(db, "users"), where("teamId", "==", teamId));
  const unsub = onSnapshot(q, snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  }, err => {
    console.error("subscribeUsersByTeam error:", err);
  });
  return unsub;
}
