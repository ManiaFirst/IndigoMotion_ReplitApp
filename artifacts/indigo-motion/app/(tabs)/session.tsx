import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SensorHUD } from "@/components/SensorHUD";
import { MODES } from "@/components/ModeCard";
import { useGlove } from "@/context/GloveContext";
import { useColors } from "@/hooks/useColors";

function PulseDot({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.6, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 10, height: 10, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          opacity: 0.35,
          transform: [{ scale: anim }],
        }}
      />
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

export default function SessionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    activeMode,
    isSessionActive,
    isRecording,
    startSession,
    stopSession,
    startRecording,
    stopRecording,
  } = useGlove();
  const [elapsed, setElapsed] = useState(0);
  const [recElapsed, setRecElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const mode = MODES.find((m) => m.id === activeMode);
  const accent = mode?.accent ?? colors.primary;
  const leftAccent = "#a78bfa";
  const rightAccent = "#06b6d4";

  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isSessionActive]);

  useEffect(() => {
    if (isRecording) {
      setRecElapsed(0);
      recTimerRef.current = setInterval(() => setRecElapsed((e) => e + 1), 1000);
    } else {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      setRecElapsed(0);
    }
    return () => { if (recTimerRef.current) clearInterval(recTimerRef.current); };
  }, [isRecording]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.statusRow}>
            {isSessionActive && <PulseDot color="#22c55e" />}
            <Text style={[styles.statusText, { color: isSessionActive ? "#22c55e" : colors.mutedForeground }]}>
              {isSessionActive ? "LIVE" : "STANDBY"}
            </Text>
            {isSessionActive && (
              <Text style={[styles.timer, { color: colors.mutedForeground }]}>{fmt(elapsed)}</Text>
            )}
          </View>

          {/* Recording indicator in top bar */}
          {isRecording && (
            <View style={styles.recBadge}>
              <PulseDot color="#ef4444" />
              <Text style={styles.recText}>REC {fmt(recElapsed)}</Text>
            </View>
          )}
        </View>

        {/* Mode info */}
        {mode ? (
          <View style={[styles.modeHeader, { borderColor: accent, backgroundColor: `${accent}12` }]}>
            <View style={[styles.modeIconWrap, { backgroundColor: `${accent}25` }]}>
              <MaterialCommunityIcons name={mode.icon as any} size={28} color={accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modeName, { color: colors.foreground }]}>{mode.name}</Text>
              <Text style={[styles.modeDesc, { color: colors.mutedForeground }]}>{mode.description}</Text>
            </View>
            <View style={[styles.modeTag, { backgroundColor: `${accent}22` }]}>
              <Text style={[styles.modeTagText, { color: accent }]}>{mode.tag}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.modeHeader, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.modeDesc, { color: colors.mutedForeground }]}>
              No mode selected — go to Perform to pick one
            </Text>
          </View>
        )}

        {/* Sensor HUD */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SENSOR DATA</Text>
        <SensorHUD leftAccent={leftAccent} rightAccent={rightAccent} />

        {/* Controls */}
        <View style={styles.controls}>
          {!isSessionActive ? (
            <Pressable
              style={({ pressed }) => [
                styles.mainBtn,
                {
                  backgroundColor: mode ? accent : colors.muted,
                  opacity: pressed ? 0.8 : 1,
                  shadowColor: accent,
                  shadowOpacity: mode ? 0.4 : 0,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 6 },
                },
              ]}
              onPress={() => mode && startSession()}
              disabled={!mode}
            >
              <MaterialCommunityIcons name="play" size={22} color="#fff" />
              <Text style={styles.mainBtnText}>Start Session</Text>
            </Pressable>
          ) : (
            <View style={styles.controlRow}>
              {/* Record / Stop Recording button */}
              {!isRecording ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.recBtn,
                    {
                      backgroundColor: "#ef444418",
                      borderColor: "#ef4444",
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  onPress={startRecording}
                >
                  <View style={styles.recDot} />
                  <Text style={[styles.recBtnText, { color: "#ef4444" }]}>Record</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.recBtn,
                    {
                      backgroundColor: "#ef4444",
                      borderColor: "#ef4444",
                      opacity: pressed ? 0.75 : 1,
                      shadowColor: "#ef4444",
                      shadowOpacity: 0.45,
                      shadowRadius: 14,
                      shadowOffset: { width: 0, height: 4 },
                    },
                  ]}
                  onPress={stopRecording}
                >
                  <MaterialCommunityIcons name="stop" size={16} color="#fff" />
                  <Text style={[styles.recBtnText, { color: "#fff" }]}>Save {fmt(recElapsed)}</Text>
                </Pressable>
              )}

              {/* Stop session */}
              <Pressable
                style={({ pressed }) => [
                  styles.stopBtn,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={stopSession}
              >
                <MaterialCommunityIcons name="stop" size={20} color={colors.mutedForeground} />
                <Text style={[styles.stopBtnText, { color: colors.mutedForeground }]}>Stop</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 14 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  backBtn: { padding: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, marginLeft: 8 },
  statusText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  timer: { fontSize: 12, fontFamily: "Inter_400Regular" },
  recBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ef444420",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  recText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#ef4444", letterSpacing: 0.5 },
  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  modeIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modeName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  modeDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  modeTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  modeTagText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: -6,
  },
  controls: { marginTop: 6 },
  mainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
  },
  mainBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  controlRow: { flexDirection: "row", gap: 10 },
  recBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },
  recBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  stopBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  stopBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
