import React, { useEffect, useRef, useState } from "react";

/**
 * InhaleExhaleBreathing with Audio
 * --------------------------------
 * A React component that guides through inhale–hold–exhale breathing cycles
 * with smooth animations and optional audio cues.
 *
 * Props:
 *  - inhale, hold, exhale: durations (in seconds)
 *  - size: circle diameter
 *  - loop: repeat indefinitely
 *  - autoStart: whether to start automatically
 *  - showControls: whether to show control buttons
 *  - sound: boolean to enable/disable audio
 *  - audioSrc: optional object with URLs for inhale/hold/exhale sounds
 */

const PHASES = ["inhale", "hold", "exhale"];

export default function InhaleExhaleBreathing({
  inhale = 4,
  hold = 4,
  exhale = 6,
  size = 300,
  loop = true,
  autoStart = true,
  showControls = true,
  sound = true,
  audioSrc = {
    inhale: "/sounds/inhale.mp3",
    hold: "/sounds/hold.mp3",
    exhale: "/sounds/exhale.mp3",
  },
}) {
  const [running, setRunning] = useState(autoStart);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(inhale);
  const intervalRef = useRef(null);

  const audioRefs = {
    inhale: useRef(null),
    hold: useRef(null),
    exhale: useRef(null),
  };

  const getPhaseDuration = (phase) => {
    if (phase === "inhale") return inhale;
    if (phase === "hold") return hold;
    if (phase === "exhale") return exhale;
    return 0;
  };

  useEffect(() => {
    const currentPhase = PHASES[phaseIndex];
    setSecondsLeft(getPhaseDuration(currentPhase));
    if (sound && audioRefs[currentPhase]?.current) {
      audioRefs[currentPhase].current.currentTime = 0;
      audioRefs[currentPhase].current.play().catch(() => {});
    }
  }, [phaseIndex]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          advancePhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, phaseIndex]);

  const advancePhase = () => {
    let next = (phaseIndex + 1) % PHASES.length;
    if (PHASES[next] === "hold" && hold === 0) next = (next + 1) % PHASES.length;
    if (next === 0 && !loop) setRunning(false);
    setPhaseIndex(next);
  };

  const restart = () => {
    setPhaseIndex(0);
    setSecondsLeft(inhale);
    setRunning(true);
  };

  const phase = PHASES[phaseIndex];
  const scale =
    phase === "inhale"
      ? 1 + 0.25 * (1 - secondsLeft / inhale)
      : phase === "hold"
      ? 1.25
      : 1 + 0.25 * (secondsLeft / exhale);

  const label =
    phase === "inhale"
      ? "Inhale"
      : phase === "hold"
      ? "Hold"
      : "Exhale";

  return (
    <div
      className="max-w-lg w-full mx-auto p-6 rounded-2xl shadow-xl bg-gradient-to-b from-slate-900 to-slate-800 text-white text-center"
      role="application"
      aria-label="Inhale exhale breathing exercise"
    >
      {/* Circle animation */}
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full border border-white/10"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}
        ></div>
        <div
          className="absolute inset-8 rounded-full bg-gradient-to-b from-indigo-500/40 to-indigo-400/10 flex items-center justify-center transition-transform duration-700 ease-in-out"
          style={{ transform: `scale(${scale})` }}
        >
          <div>
            <p className="text-3xl font-semibold">{label}</p>
            <p className="text-white/70 text-sm mt-1">{secondsLeft}s</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setRunning((r) => !r)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={restart}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
          >
            Restart
          </button>
        </div>
      )}

      {/* Audio Elements */}
      {sound && (
        <>
          <audio ref={audioRefs.inhale} src={audioSrc.inhale} preload="auto" />
          <audio ref={audioRefs.hold} src={audioSrc.hold} preload="auto" />
          <audio ref={audioRefs.exhale} src={audioSrc.exhale} preload="auto" />
        </>
      )}
    </div>
  );
}
