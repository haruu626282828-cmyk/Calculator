import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "calcpro-sound-enabled";

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedContext) {
    sharedContext = new AudioCtx();
  }
  return sharedContext;
}

function playTone(frequency: number, duration: number, gainValue: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gainNode.gain.value = gainValue;

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(gainValue, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

export function useSound() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const playKeyPress = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(440, 0.05, 0.04);
  }, []);

  const playEquals = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(660, 0.12, 0.05);
  }, []);

  const playError = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(160, 0.2, 0.06);
  }, []);

  const toggleSound = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return { enabled, toggleSound, playKeyPress, playEquals, playError };
}
