import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type FingerName = "thumb" | "index" | "middle" | "ring" | "pinky";

export interface FingerState {
  bend: number;
}

export interface HandState {
  connected: boolean;
  battery: number;
  fingers: Record<FingerName, FingerState>;
  orientation: {
    pitch: number;
    roll: number;
    yaw: number;
  };
}

export type PerformMode =
  | "melodic_flow"
  | "bass_sculptor"
  | "filter_sweep"
  | "arp_weaver"
  | "drone_forge";

export interface SavedSession {
  id: string;
  modeName: string;
  modeAccent: string;
  date: string;
  duration: number; // seconds
}

export interface GloveContextValue {
  leftHand: HandState;
  rightHand: HandState;
  activeMode: PerformMode | null;
  isSessionActive: boolean;
  isRecording: boolean;
  savedSessions: SavedSession[];
  setActiveMode: (mode: PerformMode) => void;
  startSession: () => void;
  stopSession: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  deleteSession: (id: string) => void;
}

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

const SESSIONS_KEY = "im_saved_sessions";

const MOCK_SESSIONS: SavedSession[] = [
  { id: "s1", modeName: "Melodic Flow", modeAccent: "#a78bfa", date: "2026-04-05T21:00:00Z", duration: 423 },
  { id: "s2", modeName: "Bass Sculptor", modeAccent: "#06b6d4", date: "2026-04-04T18:30:00Z", duration: 887 },
  { id: "s3", modeName: "Filter Sweep", modeAccent: "#d946ef", date: "2026-04-03T22:15:00Z", duration: 310 },
];

const GloveContext = createContext<GloveContextValue | null>(null);

export function GloveProvider({ children }: { children: React.ReactNode }) {
  const [leftHand, setLeftHand] = useState<HandState>(makeDefaultHand(true));
  const [rightHand, setRightHand] = useState<HandState>(makeDefaultHand(true));
  const [activeMode, setActiveMode] = useState<PerformMode | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(MOCK_SESSIONS);
  const animFrameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef(0);
  const sessionStartRef = useRef<number>(0);
  const recordingStartRef = useRef<number>(0);

  useEffect(() => {
    AsyncStorage.getItem(SESSIONS_KEY).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as SavedSession[];
          setSavedSessions([...MOCK_SESSIONS, ...parsed]);
        } catch {}
      }
    });
  }, []);

  const persistSessions = (sessions: SavedSession[]) => {
    const nonMock = sessions.filter((s) => !["s1", "s2", "s3"].includes(s.id));
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(nonMock));
  };

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

  const startSession = () => {
    sessionStartRef.current = Date.now();
    setIsSessionActive(true);
  };

  const stopSession = () => {
    setIsSessionActive(false);
    setIsRecording(false);
    setLeftHand(makeDefaultHand(true));
    setRightHand(makeDefaultHand(true));
  };

  const startRecording = () => {
    recordingStartRef.current = Date.now();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!isRecording || !activeMode) return;
    const duration = Math.round((Date.now() - recordingStartRef.current) / 1000);
    const modeNames: Record<PerformMode, string> = {
      melodic_flow: "Melodic Flow",
      bass_sculptor: "Bass Sculptor",
      filter_sweep: "Filter Sweep",
      arp_weaver: "Arp Weaver",
      drone_forge: "Drone Forge",
    };
    const modeAccents: Record<PerformMode, string> = {
      melodic_flow: "#a78bfa",
      bass_sculptor: "#06b6d4",
      filter_sweep: "#d946ef",
      arp_weaver: "#22c55e",
      drone_forge: "#f59e0b",
    };
    const newSession: SavedSession = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      modeName: modeNames[activeMode],
      modeAccent: modeAccents[activeMode],
      date: new Date().toISOString(),
      duration,
    };
    setSavedSessions((prev) => {
      const updated = [newSession, ...prev];
      persistSessions(updated);
      return updated;
    });
    setIsRecording(false);
  };

  const deleteSession = (id: string) => {
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persistSessions(updated);
      return updated;
    });
  };

  return (
    <GloveContext.Provider
      value={{
        leftHand, rightHand, activeMode, isSessionActive, isRecording,
        savedSessions, setActiveMode, startSession, stopSession,
        startRecording, stopRecording, deleteSession,
      }}
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
