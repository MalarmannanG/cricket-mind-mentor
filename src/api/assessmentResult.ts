// src/api/results.js
import { db, serverTimestamp } from "../firebase";
import {
  addDoc,
  collection,
  setDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  updateDoc
} from "firebase/firestore";
import { getAllQuestions } from "./questions";
import { PerQuestionEvaluation } from "@/types";


/**
 * answers input shape:
 *   { Q1: "A", Q2: "C", ... }   // mapping questionId -> optionId
 *
 * This function:
 *  - loads test questions & options
 *  - computes rawScore, maxScore, percent
 *  - returns { rawScore, maxScore, percent, perQuestion: [{ questionId, optionId, mark, logic }] }
 */
export async function evaluateAnswers(answersMap) {
  const questions = await getAllQuestions();
  let raw = 0;
  let max = 0;
  const perQuestion = [];

  for (const q of questions) {
    const qMax = q.options.reduce((m, o) => Math.max(m, o.mark), -Infinity);
    max += qMax > 0 ? qMax : 0; // only positive marks count to max theoretical positive score
    const selectedId = answersMap[q.id] ?? null;
    const opt = q.options.find(o => o.id === selectedId);
    const mark = opt ? opt.mark : 0;
    raw += mark;
    perQuestion.push({
      questionId: q.id,
      optionId: selectedId,
      mark,
      logic: opt ? opt.logic : null,
      optionText: opt ? opt.text : null,
      questionText: q.question
    });
  }

  // to avoid division by zero
  const percent = max !== 0 ? Math.round((raw / (max)) * 100) : 0;
  return { rawScore: raw, maxScore: max, percent, perQuestion, id:null };
}

/**
 * Evaluate and save result atomically:
 * - Writes results collection doc (auto-id)
 * - Writes subcollection 'answers' under result with docs per question (questionId as doc id)
 *
 * returns saved result id and computed payload
 */

export async function updateAssesmentResult(data, assessmentId) {
   if (assessmentId) {
    await updateDoc(doc(db, "results", assessmentId), data);
    return { id: assessmentId, data };
  }
}
export async function addAssesmentResult(data) {
   const resultRef = await addDoc(collection(db, "results"), data);
   return { id: resultRef.id, data };
}
export async function evaluateAndSaveResult(playerId, answersMap, assessmentId) {
  // compute scoring
  const evaluation = await evaluateAnswers(answersMap);
  const answer: PerQuestionEvaluation[] = [];
  evaluation.perQuestion.forEach(pq => {
    answer.push({
      optionId: pq.optionId,
      mark: pq.mark,
      logic: pq.logic,
      questionId: pq.questionId,
      optionText: pq.optionText,
      questionText: pq.questionText
    });
  });
  // save result doc
  if (assessmentId) {
    const data = {
      playerId,
      rawScore: evaluation.rawScore,
      maxScore: evaluation.maxScore,
      percent: evaluation.percent,
      createdAt: serverTimestamp(),
      perQuestion: answer
    };
    const resultRef = await updateDoc(doc(db, "results", assessmentId), data);

    return { id: assessmentId, evaluation };
  }
  else {
    const resultRef = await addDoc(collection(db, "results"), {
      playerId,
      rawScore: evaluation.rawScore,
      maxScore: evaluation.maxScore,
      percent: evaluation.percent,
      createdAt: serverTimestamp(),
      perQuestion: answer
    });
    return { id: resultRef.id, evaluation };
  }
  // save answers as subcollection under results/{resultId}/answers/{Q1}
  // const batch = writeBatch(db);
  // evaluation.perQuestion.forEach(pq => {
  //   const ansRef = doc(db, "results", resultRef.id, "answers", pq.questionId);
  //   batch.set(ansRef, {
  //     optionId: pq.optionId,
  //     mark: pq.mark,
  //     logic: pq.logic,
  //     questionId: pq.questionId,
  //     optionText : pq.optionText,
  //     questionText : pq.questionText

  //   });
  // });

  // await batch.commit();


}

/* ---------- Fetch / subscribe ---------- */

/**
 * List results for a specific test (one-time)
 */
export async function listResultsByTest(testId) {
  const q = query(collection(db, "results"), where("testId", "==", testId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to results for a test (real-time)
 */
export function subscribeResultsByTest(testId, cb) {
  const q = query(collection(db, "results"), where("testId", "==", testId), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(list);
  }, err => console.error("subscribeResultsByTest", err));
  return unsub;
}

/**
 * Get one result with answers
 */
export async function getResultWithAnswers(resultId) {
  const rSnap = await getDoc(doc(db, "results", resultId));
  if (!rSnap.exists()) return null;
  const answersSnap = await getDocs(collection(db, "results", resultId, "answers"));
  return {
    id: rSnap.id,
    ...rSnap.data(),
    answers: answersSnap.docs.map(a => ({ questionId: a.id, ...a.data() }))
  };
}
