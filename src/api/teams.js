// src/api/teams.js
import { db, serverTimestamp } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
  getDocs,
  onSnapshot
} from "firebase/firestore";

/**
 * Create team with custom ID (e.g., T001)
 */
export async function createTeam(teamId, data) {
  const ref = doc(db, "teams", teamId);
  await setDoc(ref, { ...data, createdAt: serverTimestamp() }, { merge: true });
  return teamId;
}

export async function getTeam(teamId) {
  const ref = doc(db, "teams", teamId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateTeam(teamId, updates) {
  await updateDoc(doc(db, "teams", teamId), updates);
  return true;
}

export async function deleteTeam(teamId) {
  // Note: this will not delete subcollections (players). Use admin SDK for full cleanup.
  await deleteDoc(doc(db, "teams", teamId));
  return true;
}

/**
 * Add player to team (atomic): 
 *  - sets users/{userId}.teamId = teamId
 *  - creates teams/{teamId}/players/{userId} { userId }
 */
export async function addPlayerToTeam(teamId, userId) {
  const batch = writeBatch(db);
  const userRef = doc(db, "users", userId);
  const teamPlayerRef = doc(db, "teams", teamId, "players", userId);

  batch.set(userRef, { teamId }, { merge: true });
  batch.set(teamPlayerRef, { userId, addedAt: serverTimestamp() }, { merge: true });

  await batch.commit();
  return true;
}

/**
 * Remove player from team (atomic): clear users.teamId and delete team players doc
 */
export async function removePlayerFromTeam(teamId, userId) {
  const batch = writeBatch(db);
  const userRef = doc(db, "users", userId);
  const teamPlayerRef = doc(db, "teams", teamId, "players", userId);

  batch.update(userRef, { teamId: null });
  batch.delete(teamPlayerRef);

  await batch.commit();
  return true;
}

/**
 * Subscribe to team players (real-time) -> returns unsubscribe
 */
export function subscribeTeamPlayers(teamId, callback) {
  const coll = collection(db, "teams", teamId, "players");
  const unsub = onSnapshot(coll, snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  }, err => console.error("subscribeTeamPlayers error:", err));
  return unsub;
}
