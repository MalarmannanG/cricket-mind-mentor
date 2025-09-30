// src/api/activities.js
import { db, serverTimestamp } from "../firebase";
import { collection, addDoc, query, where, getDocs, onSnapshot } from "firebase/firestore";

/**
 * Save handwritten affirmation strokes (store stroke points array)
 * strokes: [{x,y,t}, ...] or compressed representation
 * don't store as file; store as small JSON
 */
export async function saveAffirmation(playerId, strokes, meta = {}) {
  const ref = collection(db, "activities");
  const docRef = await addDoc(ref, {
    playerId,
    type: "affirmation",
    strokes,
    meta,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

/**
 * Mark camera talk completion (no video stored)
 */
export async function saveCameraMark(playerId, meta = {}) {
  const ref = collection(db, "activities");
  const docRef = await addDoc(ref, {
    playerId,
    type: "camera_talk",
    meta,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

/**
 * Save that a breathing/visualization timer was completed
 * type "breathing" or "visualization", durationSeconds number
 */
export async function saveTimerCompletion(playerId, type, durationSeconds, meta = {}) {
  const ref = collection(db, "activities");
  const docRef = await addDoc(ref, {
    playerId,
    type,
    durationSeconds,
    meta,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

/**
 * Query activities for a player (one-time)
 */
export async function getActivitiesForPlayer(playerId, limit = 100) {
  const q = query(collection(db, "activities"), where("playerId", "==", playerId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to activities for a player (real-time)
 */
export function subscribeActivitiesForPlayer(playerId, cb) {
  const q = query(collection(db, "activities"), where("playerId", "==", playerId));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
