import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type FingerName = "thumb" | "index" | "middle" | "ring" | "pinky";

export interface FingerState {
  bend: number; // 0.0 = open, 1.0 = fully closed
}

export interface HandState {
  connected: boolean;
  battery: number; // 0–100
  fingers: Record<FingerName, FingerState>;
  orientation: {
    pitch: number; // degrees -90 to 90
    roll: number;  // degrees -180 to 180
    yaw: number;   // degrees -180 to 180
  };
}

export type PerformMode =
  | "melodic_flow"
  | "bass_sculptor"
  | "filter_sweep"
  | "arp_weaver"
  | "drone_forge";

export interface GloveContextValue {
  leftHand: HandState;
  rightHand: HandState;
  activeMode: PerformMode | null;
  isSessionActive: boolean;
  setActiveMode: (mode: PerformMode) => void;
  startSession: () => void;
  stopSession: () => void;
}

const FINGER_NAMES: FingerName[] = ["thumb", "index", "middle", "ring", "pinky"];

function makeDefaultHand(connected: boolean): HandState {
  return {
    connected,
    battery: connected ? 87 : 0,
    fingers: {
      thumb: { bend: 0 },
      index: { bend: 0 },
      middle: { bend: 0 },
      ring: { bend: 0 },
      pinky: { bend: 0 },
    },
    orientation: { pitch: 0, roll: 0, yaw: 0 },
  };
}

const GloveContext = createContext<GloveContextValue | null>(null);

export function GloveProvider({ children }: { children: React.ReactNode }) {
  const [leftHand, setLeftHand] = useState<HandState>(makeDefaultHand(true));
  const [rightHand, setRightHand] = useState<HandState>(makeDefaultHand(true));
  const [activeMode, setActiveMode] = useState<PerformMode | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const animFrameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isSessionActive) {
      if (animFrameRef.current) clearInterval(animFrameRef.current);
      return;
    }
    animFrameRef.current = setInterval(() => {
      timeRef.current += 0.04;
      const t = timeRef.current;

      const simulate = (hand: HandState, offset: number): HandState => ({
        ...hand,
        fingers: {
          thumb:  { bend: Math.max(0, Math.min(1, 0.5 + 0.45 * Math.sin(t * 0.9 + offset))) },
          index:  { bend: Math.max(0, Math.min(1, 0.5 + 0.45 * Math.sin(t * 1.1 + offset + 0.5))) },
          middle: { bend: Math.max(0, Math.min(1, 0.5 + 0.45 * Math.sin(t * 0.8 + offset + 1.0))) },
          ring:   { bend: Math.max(0, Math.min(1, 0.5 + 0.45 * Math.sin(t * 1.3 + offset + 1.5))) },
          pinky:  { bend: Math.max(0, Math.min(1, 0.5 + 0.45 * Math.sin(t * 1.0 + offset + 2.0))) },
        },
        orientation: {
          pitch: 30 * Math.sin(t * 0.5 + offset),
          roll: 45 * Math.sin(t * 0.3 + offset + 1),
          yaw: 60 * Math.sin(t * 0.2 + offset + 2),
        },
      });

      setLeftHand((h) => simulate(h, 0));
      setRightHand((h) => simulate(h, Math.PI));
    }, 40);
    return () => {
      if (animFrameRef.current) clearInterval(animFrameRef.current);
    };
  }, [isSessionActive]);

  const startSession = () => setIsSessionActive(true);
  const stopSession = () => {
    setIsSessionActive(false);
    setLeftHand(makeDefaultHand(true));
    setRightHand(makeDefaultHand(true));
  };

  return (
    <GloveContext.Provider
      value={{ leftHand, rightHand, activeMode, isSessionActive, setActiveMode, startSession, stopSession }}
    >
      {children}
    </GloveContext.Provider>
  );
}

export function useGlove(): GloveContextValue {
  const ctx = useContext(GloveContext);
  if (!ctx) throw new Error("useGlove must be used within GloveProvider");
  return ctx;
}
