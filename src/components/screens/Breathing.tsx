import React, { useEffect, useRef, useState } from "react";

export default function Breathing({onComplete}: {onComplete?: () => void}) {
  // Refs for DOM elements
  const circleRef = useRef(null);

  // UI/state
  const [durationMinutes, setDurationMinutes] = useState(3);
  const [sessionSeconds, setSessionSeconds] = useState(Math.round(.5 * 60));
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(-1);
  const [phaseRemaining, setPhaseRemaining] = useState(0);
  const [phaseName, setPhaseName] = useState("Idle");
  const [phaseCount, setPhaseCount] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // audio context kept in ref
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  const TICK_MS = 200; // matches original 200ms tick

  const PHASES = useRef([
    { name: "Inhale", duration: 4, action: "inhale" },
    { name: "Hold", duration: 4, action: "hold" },
    { name: "Exhale", duration: 4, action: "exhale" },
    { name: "Hold", duration: 4, action: "hold" }
  ]).current;

  useEffect(() => {
    setSessionSeconds(Math.round(durationMinutes * 60));
  }, [durationMinutes]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeech();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // --- audio helpers
  function ensureAudioCtx() {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext )();
      if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
      return audioCtxRef.current;
    } catch (e) {
      return null;
    }
  }

  function playTone(freq = 880, duration = 0.15, type = "sine") {
    if (isMuted) return;
    try {
      const ac = ensureAudioCtx();
      if (!ac) return;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ac.destination);
      const now = ac.currentTime;
      g.gain.setTargetAtTime(0.12, now, 0.01);
      o.start(now);
      g.gain.setTargetAtTime(0.0001, now + duration, 0.02);
      o.stop(now + duration + 0.03);
    } catch (e) {
      // ignore
    }
  }

  function speak(text) {
    if (!voiceEnabled || isMuted) return;
    if (!('speechSynthesis' in window)) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 0.9;
      utter.volume = 0.9;
      const voices = speechSynthesis.getVoices();
      if (voices && voices.length) {
        utter.voice = voices.find(v => /en|female|Google/i.test(v.name)) || voices[0];
      }
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    } catch (e) {}
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  // helpers
  function formatTime(s) {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.max(0, s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function resetSession() {
    stopSpeech();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setElapsed(0);
    setPhaseIndex(-1);
    setPhaseRemaining(0);
    setIsRunning(false);
    setIsPaused(false);
    setCycleCount(0);
    setSessionSeconds(Math.round(durationMinutes * 60));
    setPhaseName('Idle');
    setPhaseCount(0);
    if (circleRef.current) {
      circleRef.current.style.width = '220px';
      circleRef.current.style.height = '220px';
      circleRef.current.style.transition = '';
    }
  }

  function finishSession() {
    playTone(1100, 0.35, 'triangle');
    speak('Session complete. Well done.');
    resetSession();
    onComplete();
  }

  function nextPhase(incrementElapsed1 = 0) {
    const incrementElapsed = 0;
    setPhaseIndex(prev => {
      const next = (prev + 1) % PHASES.length;
      const cur = PHASES[next];
      // increment cycle when we wrap to 0 (and not initial -1)
      setCycleCount(prevCycles => (next === 0 && (elapsed > 0 || incrementElapsed > 0)) ? prevCycles + 1 : prevCycles);
      setPhaseName(cur.name);
      setPhaseRemaining(cur.duration);
      setPhaseCount(cur.duration);
      // visual + audio
      if (cur.action === 'inhale') {
        animateCircle(260, 260, cur.duration);
        playTone(880, 0.15, 'sine');
        speak('Inhale for four seconds');
      } else if (cur.action === 'exhale') {
        animateCircle(140, 140, cur.duration);
        playTone(440, 0.15, 'sine');
        speak('Exhale for four seconds');
      } else {
        animateCircle(200, 200, cur.duration);
        playTone(660, 0.12, 'sawtooth');
        speak(cur.name === 'Hold' ? 'Hold' : `${cur.name} for ${cur.duration} seconds`);
      }
      return next;
    });
  }

  function animateCircle(w, h, durationSec) {
    if (!circleRef.current) return;
    circleRef.current.style.transition = 'width ' + Math.max(0.5, durationSec * 0.9) + 's ease, height ' + Math.max(0.5, durationSec * 0.9) + 's ease';
    circleRef.current.style.width = w + 'px';
    circleRef.current.style.height = h + 'px';
  }

  function tick(_isRunning, _isPaused) {
    if (!_isRunning || _isPaused) return;
    // advance elapsed by TICK_MS
    setElapsed(prev => {
      const nextElapsed = +(prev + TICK_MS / 1000).toFixed(3);
      const remaining = Math.max(0, Math.round(sessionSeconds - nextElapsed));
      // manage phase remaining
      setPhaseRemaining(prevPhaseRem => {
        const newRem = +(prevPhaseRem - TICK_MS / 1000).toFixed(3);
        if (newRem > 0) {
          setPhaseCount(Math.max(0, Math.ceil(newRem)));
          return newRem;
        } else {
          // phase ended - move to next phase
          nextPhase(1);
          return 0;
        }
      });
      // progress to finish
      if (nextElapsed >= sessionSeconds - 0.001) {
        console.log('finish');
        finishSession();
        return 0;
      }
      return nextElapsed;
    });
  }

  function startSession() {
    if (isRunning) return;
    if (sessionSeconds <= 0) return;
    setIsRunning(true);
    setIsPaused(false);
    // ensure audio context created on user gesture
    //try { ensureAudioCtx(); } catch (e) {}
    // start with phase 0
    nextPhase(1);
    //if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(function() { tick(true, false); }, TICK_MS);
  }

  function pauseSession() {
    if (!isRunning) return;
    setIsPaused(prev => {
      const newVal = !prev;
      if (newVal) stopSpeech();
      return newVal;
    });
  }

  function stopSession() {
    resetSession();
  }

  // keyboard shortcuts (attach once)
  useEffect(() => {
    function onKey(e) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); if (!isRunning) startSession(); else pauseSession(); }
      if (e.key === 's') stopSession();
      if (e.key === 'm') { setIsMuted(prev => !prev); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // ensure voices loaded
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = () => {};
    }
  }, []);

  // compute derived UI values
  const remainingDisplay = formatTime(Math.max(0, Math.round(sessionSeconds - elapsed)));
  const progressPct = Math.min(100, Math.round((elapsed / sessionSeconds) * 100) || 0);

  return (
    
     <div
  role="application"
  aria-label="4-4-4-4 breathing routine"
  className="max-w-3xl w-full mx-auto rounded-2xl p-6 shadow-lg bg-gradient-to-b from-white to-blue-50 text-slate-800 font-inter"
>
  {/* Header */}
  <header className="flex items-center justify-between flex-wrap gap-3">
    <div>
      <h1 className="text-lg font-semibold text-slate-900">
        4-4-4-4 Breathing — Audio Prototype
      </h1>
      <p className="text-sm text-slate-600 mt-1">
        Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Default session:{" "}
        <strong className="text-slate-800">3 minutes</strong>.
      </p>
    </div>
    <div className="text-xs text-slate-500">
      Prototype — no external audio files (Web Audio + SpeechSynthesis)
    </div>
  </header>

  {/* Main */}
  <div className="mt-6 flex flex-wrap justify-between gap-6">
    {/* Circle Visual */}
    <div className="flex justify-center items-center w-80 h-80">
      <div
        ref={circleRef}
        className="w-56 h-56 rounded-full border border-blue-300 bg-gradient-to-b from-blue-100 to-white shadow-inner flex flex-col items-center justify-center transition-all duration-700 ease-in-out"
      >
        <div className="text-center text-slate-600">
          <div className="text-[13px] uppercase tracking-wide">Phase</div>
          <div className="text-lg font-semibold text-slate-800">{phaseName}</div>
          <div className="text-2xl font-bold text-blue-600">{phaseCount}</div>
        </div>
      </div>
    </div>

    {/* Controls */}
    <div className="flex flex-col gap-4 flex-1">
      {/* Buttons */}
      <div role="toolbar" aria-label="session controls" className="flex gap-2 flex-wrap">
        <button
          onClick={() => startSession()}
          disabled={isRunning}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50"
        >
          Start
        </button>

        <button
          onClick={() => pauseSession()}
          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-100"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>

        <button
          onClick={() => stopSession()}
          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-100"
        >
          Stop
        </button>

        <button
          onClick={() => {
            setIsMuted((prev) => {
              const nv = !prev;
              if (nv) stopSpeech();
              return nv;
            });
          }}
          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-100"
        >
          {`Mute: ${isMuted ? "On" : "Off"}`}
        </button>
      </div>

      {/* Settings */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-4 shadow-sm">
        {/* Session length + voice toggle */}
        <div className="flex justify-between items-center">
          <div>
            <label className="text-slate-600 text-xs">Session length {durationMinutes} (minutes)</label>
            {/* <input
              type="number"
              min="0.5"
              max="60"
              step="0.5"
              disabled={true}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
              className="mt-1 w-20 px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-800 text-sm focus:ring-1 focus:ring-blue-400"
            /> */}
          </div>

          <div className="flex flex-col items-end">
            <label className="text-slate-600 text-xs">Voice prompts</label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="accent-blue-500 w-4 h-4"
              />
              <span>{voiceEnabled ? "Enabled" : "Disabled"}</span>
            </label>
          </div>
        </div>

        {/* Remaining & Progress */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-slate-600 text-xs">Remaining</div>
            <div className="font-extrabold text-lg text-slate-800">{remainingDisplay}</div>
          </div>
          <div className="w-[55%]">
            <div className="text-slate-600 text-xs mb-1">Session progress</div>
            <div
              className="h-2 bg-slate-200 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct}
            >
              <div
                id="progressBar"
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cycle + Reset */}
      <div className="flex justify-between items-center text-slate-600 text-sm">
        <div>
          Cycle: <strong className="text-slate-900">{cycleCount}</strong>
        </div>
        <button
          onClick={() => {
            setDurationMinutes(3);
            setSessionSeconds(3 * 60);
            resetSession();
          }}
          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-100"
        >
          Reset to 3m
        </button>
      </div>
    </div>
  </div>
</div>
  );
}
