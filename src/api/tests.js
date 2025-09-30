// src/api/tests.js
import { db, serverTimestamp } from "../firebase";
import {
  doc,
  collection,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
  onSnapshot
} from "firebase/firestore";

/* ---------- Tests (meta) ---------- */

/**
 * Create test doc with custom ID
 * testId e.g., "Quarter1_Assessment"
 */
export async function createTest(testId, data) {
  const ref = doc(db, "tests", testId);
  await setDoc(ref, { ...data, createdAt: serverTimestamp() }, { merge: true });
  return testId;
}

export async function getTest(testId) {
  const ref = doc(db, "tests", testId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateTest(testId, updates) {
  await updateDoc(doc(db, "tests", testId), updates);
}

/**
 * Delete test doc (note: does not delete subcollections; consider admin SDK for cleanup)
 */
export async function deleteTest(testId) {
  await deleteDoc(doc(db, "tests", testId));
}

/* ---------- Questions ---------- */

/**
 * Create question doc under tests/{testId}/questions/{qid}
 * qid like "Q1", "Q2". question = { text, order }
 */
export async function createQuestion(testId, qid, question) {
  const qRef = doc(db, "tests", testId, "questions", qid);
  await setDoc(qRef, { ...question, createdAt: serverTimestamp() }, { merge: true });
  return qid;
}

export async function getQuestions(testId) {
  const qRef = collection(db, "tests", testId, "questions");
  const q = query(qRef, orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ---------- Options (A/B/C/D) as docs under question ---------- */

/**
 * Create option doc with ID "A"|"B"|"C"|"D"
 * option = { text, mark, logic }
 */
export async function createOption(testId, qid, optionId, option) {
  const optRef = doc(db, "tests", testId, "questions", qid, "options", optionId);
  await setDoc(optRef, { ...option, createdAt: serverTimestamp() }, { merge: true });
  return optionId;
}

/**
 * Get all questions with nested options (good for rendering test)
 * returns: [{ id: 'Q1', text, order, options: [{ id: 'A', text, mark, logic }, ...] }, ...]
 */
export async function getQuestionsWithOptions(testId) {
  const qSnap = await getDocs(query(collection(db, "tests", testId, "questions"), orderBy("order", "asc")));
  const questions = await Promise.all(qSnap.docs.map(async qDoc => {
    const qData = { id: qDoc.id, ...qDoc.data() };
    const optsSnap = await getDocs(collection(db, "tests", testId, "questions", qData.id, "options"));
    qData.options = optsSnap.docs.map(o => ({ id: o.id, ...o.data() }));
    return qData;
  }));
  return questions;
}

/* ---------- Assignments (teams / players) as subcollection ---------- */

/**
 * Assign test to a team or player by creating a doc under tests/{testId}/assignments
 * assignedType: "team" or "player"
 */
export async function assignTest(testId, assignedType, assignedId) {
  await addDoc(collection(db, "tests", testId, "assignments"), {
    assignedType,
    assignedId,
    assignedAt: serverTimestamp()
  });
}

/**
 * Get assignments (one-time)
 */
export async function getTestAssignments(testId) {
  const snap = await getDocs(collection(db, "tests", testId, "assignments"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to assignments
 */
export function subscribeAssignments(testId, cb) {
  const coll = collection(db, "tests", testId, "assignments");
  const unsub = onSnapshot(coll, snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(items);
  }, err => console.error("subscribeAssignments", err));
  return unsub;
}
