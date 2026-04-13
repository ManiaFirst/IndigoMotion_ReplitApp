import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalibrationSlot {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  timestamp: string;
}

type CalibPhase = "prepare" | "bend" | "stretch" | "done";

const PHASES: { id: CalibPhase; label: string; instruction: string; duration: number; color: string; icon: string }[] = [
  { id: "prepare",  label: "Get Ready",         instruction: "Keep your hands still and relaxed. Calibration is about to begin.",      duration: 5,  color: "#a78bfa", icon: "hand-wave" },
  { id: "bend",     label: "Bend Fingers",       instruction: "Slowly curl all fingers into a tight fist. Hold this position.",          duration: 7,  color: "#06b6d4", icon: "fist" },
  { id: "stretch",  label: "Stretch Fingers",    instruction: "Open your hands fully — spread all fingers as wide as possible. Hold.",   duration: 7,  color: "#22c55e", icon: "hand-back-right" },
  { id: "done",     label: "Calibration Done",   instruction: "Your gloves are calibrated and ready to use.",                           duration: 0,  color: "#22c55e", icon: "check-circle-outline" },
];

// ─── Circular countdown ring (half-circle fill technique) ────────────────────

function CircularCountdown({
  progress, // 1 = full time, 0 = expired
  countdown,
  color,
  size = 180,
}: {
  progress: number;
  countdown: number;
  color: string;
  size: number;
}) {
  const strokeW = 10;
  const half = size / 2;
  const p = Math.max(0, Math.min(1, progress));

  // Pulse animation
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
    return () => pulse.stopAnimation();
  }, []);

  // Number scale pop on each tick
  const numScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(numScale, { toValue: 1.15, duration: 80, useNativeDriver: true }),
      Animated.timing(numScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [countdown]);

  // Half-circle fill math
  const rightDeg = p <= 0.5 ? -180 + p * 360 : 0;
  const leftDeg = p > 0.5 ? (p - 0.5) * 360 : 0;
  const showLeft = p > 0.5;

  const circleStyle = {
    width: size,
    height: size,
    borderRadius: half,
    borderWidth: strokeW,
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        {/* Track */}
        <View
          style={[
            StyleSheet.absoluteFill,
            circleStyle,
            { borderColor: `${color}28` },
          ]}
        />

        {/* Progress fill — right half */}
        <View style={[StyleSheet.absoluteFill, { overflow: "hidden", borderRadius: half }]}>
          <View style={{ position: "absolute", top: 0, right: 0, width: half, height: size, overflow: "hidden" }}>
            <View
              style={[
                circleStyle,
                {
                  borderColor: color,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: [{ rotate: `${rightDeg}deg` }],
                },
              ]}
            />
          </View>

          {/* Left half (only when > 50%) */}
          {showLeft && (
            <View style={{ position: "absolute", top: 0, left: 0, width: half, height: size, overflow: "hidden" }}>
              <View
                style={[
                  circleStyle,
                  {
                    borderColor: color,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: [{ rotate: `${leftDeg}deg` }],
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Glow dot at 12-o-clock */}
        <View
          style={{
            position: "absolute",
            top: strokeW / 2 - 6,
            left: half - 6,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.9,
            shadowRadius: 8,
          }}
        />

        {/* Countdown number */}
        <Animated.Text
          style={[
            ringStyles.number,
            {
              color,
              transform: [{ scale: numScale }],
              textShadowColor: color,
              textShadowRadius: 12,
            },
          ]}
        >
          {countdown}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const ringStyles = StyleSheet.create({
  number: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
});

// ─── Phase indicator pills ────────────────────────────────────────────────────

function PhaseBar({ currentPhaseIdx }: { currentPhaseIdx: number }) {
  const colors = useColors();
  const displayPhases = PHASES.slice(0, 3);
  return (
    <View style={phaseStyles.row}>
      {displayPhases.map((ph, i) => {
        const done = i < currentPhaseIdx;
        const active = i === currentPhaseIdx;
        return (
          <View key={ph.id} style={phaseStyles.item}>
            <View
              style={[
                phaseStyles.pill,
                {
                  backgroundColor: done ? ph.color : active ? `${ph.color}30` : `${colors.border}80`,
                  borderColor: active || done ? ph.color : "transparent",
                  borderWidth: active ? 1.5 : 0,
                },
              ]}
            >
              <Text style={[phaseStyles.pillText, { color: done || active ? ph.color : colors.mutedForeground }]}>
                {ph.label}
              </Text>
            </View>
            {i < displayPhases.length - 1 && (
              <View style={[phaseStyles.connector, { backgroundColor: done ? displayPhases[i + 1].color : colors.border }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const phaseStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 0 },
  item: { flexDirection: "row", alignItems: "center" },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  connector: { width: 16, height: 1.5, marginHorizontal: 2 },
});

// ─── Calibration modal ────────────────────────────────────────────────────────

function CalibrationModal({
  visible,
  onComplete,
  onCancel,
}: {
  visible: boolean;
  onComplete: (name: string) => void;
  onCancel: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [newName, setNewName] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const countRef = useRef(PHASES[0].duration);

  const phase = PHASES[phaseIdx];
  const isDone = phase.id === "done";

  // Reset when opened
  useEffect(() => {
    if (!visible) return;
    phaseRef.current = 0;
    countRef.current = PHASES[0].duration;
    setPhaseIdx(0);
    setCountdown(PHASES[0].duration);
    setNewName(`Calib ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`);

    timerRef.current = setInterval(() => {
      countRef.current -= 1;
      if (countRef.current <= 0) {
        const nextIdx = phaseRef.current + 1;
        if (nextIdx >= PHASES.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }
        phaseRef.current = nextIdx;
        countRef.current = PHASES[nextIdx].duration;
        setPhaseIdx(nextIdx);
        setCountdown(PHASES[nextIdx].duration);
        if (PHASES[nextIdx].id === "done" && timerRef.current) {
          clearInterval(timerRef.current);
        }
      } else {
        setCountdown(countRef.current);
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible]);

  const progress = phase.duration > 0 ? countdown / phase.duration : 1;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[modalStyles.overlay, { backgroundColor: "#08030fef" }]}>
        <View style={[modalStyles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          {/* Cancel */}
          {!isDone && (
            <Pressable onPress={onCancel} style={modalStyles.cancelBtn}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          )}

          {/* Phase bar */}
          <PhaseBar currentPhaseIdx={phaseIdx} />

          {/* Icon */}
          <View style={[modalStyles.iconWrap, { backgroundColor: `${phase.color}18` }]}>
            <MaterialCommunityIcons name={phase.icon as any} size={32} color={phase.color} />
          </View>

          {/* Phase label */}
          <Text style={[modalStyles.phaseLabel, { color: phase.color }]}>{phase.label}</Text>

          {/* Circular countdown or done check */}
          {!isDone ? (
            <CircularCountdown
              progress={progress}
              countdown={countdown}
              color={phase.color}
              size={180}
            />
          ) : (
            <View style={[modalStyles.doneRing, { borderColor: phase.color, shadowColor: phase.color }]}>
              <MaterialCommunityIcons name="check" size={64} color={phase.color} />
            </View>
          )}

          {/* Instruction */}
          <Text style={[modalStyles.instruction, { color: colors.mutedForeground }]}>
            {phase.instruction}
          </Text>

          {/* Save name input (when done) */}
          {isDone && (
            <View style={modalStyles.saveArea}>
              <Text style={[modalStyles.saveLabel, { color: colors.foreground }]}>Name this calibration</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                style={[
                  modalStyles.nameInput,
                  { backgroundColor: colors.card, borderColor: phase.color, color: colors.foreground },
                ]}
                placeholderTextColor={colors.mutedForeground}
                placeholder="Calibration name"
                selectTextOnFocus
              />
              <Pressable
                style={({ pressed }) => [
                  modalStyles.saveBtn,
                  { backgroundColor: phase.color, opacity: pressed ? 0.8 : 1, shadowColor: phase.color },
                ]}
                onPress={() => onComplete(newName || "Untitled")}
              >
                <Text style={modalStyles.saveBtnText}>Save Calibration</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    paddingHorizontal: 32,
  },
  cancelBtn: {
    position: "absolute",
    top: 60,
    right: 24,
    padding: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseLabel: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  doneRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  instruction: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  saveArea: {
    width: "100%",
    gap: 12,
    alignItems: "center",
  },
  saveLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  nameInput: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  saveBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

const INITIAL_SLOTS: CalibrationSlot[] = [
  { id: "default", name: "Default",  isDefault: true,  isActive: true,  timestamp: "" },
  { id: "slot_1",  name: "Live Set A",  isDefault: false, isActive: false, timestamp: "2026-04-03" },
  { id: "slot_2",  name: "Studio Session",  isDefault: false, isActive: false, timestamp: "2026-04-01" },
];

export default function CalibrateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [slots, setSlots] = useState<CalibrationSlot[]>(INITIAL_SLOTS);
  const [calibrating, setCalibrating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const activeSlot = slots.find((s) => s.isActive);

  const handleUse = (id: string) => {
    setSlots((prev) => prev.map((s) => ({ ...s, isActive: s.id === id })));
  };

  const handleDelete = (id: string) => {
    setSlots((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      // If we deleted the active one, make default active
      if (!updated.find((s) => s.isActive)) {
        return updated.map((s) => ({ ...s, isActive: s.isDefault }));
      }
      return updated;
    });
  };

  const handleEditStart = (slot: CalibrationSlot) => {
    if (slot.isDefault) return;
    setEditingId(slot.id);
    setEditValue(slot.name);
  };

  const handleEditDone = () => {
    if (!editingId) return;
    setSlots((prev) =>
      prev.map((s) => (s.id === editingId ? { ...s, name: editValue || s.name } : s))
    );
    setEditingId(null);
  };

  const handleCalibComplete = (name: string) => {
    const newSlot: CalibrationSlot = {
      id: `slot_${Date.now()}`,
      name,
      isDefault: false,
      isActive: true,
      timestamp: new Date().toISOString().split("T")[0],
    };
    setSlots((prev) => [
      ...prev.map((s) => ({ ...s, isActive: false })),
      newSlot,
    ]);
    setCalibrating(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <CalibrationModal
        visible={calibrating}
        onComplete={handleCalibComplete}
        onCancel={() => setCalibrating(false)}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Calibration</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Press Calibrate, then follow the on-screen instructions that match the incoming glove status.
        </Text>

        {/* Active slot pill */}
        {activeSlot && (
          <View style={[styles.activeSlotCard, { backgroundColor: `#7C3AED18`, borderColor: "#7C3AED" }]}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#7C3AED" />
            <Text style={[styles.activeSlotLabel, { color: "#a78bfa" }]}>
              Active: <Text style={{ fontFamily: "Inter_700Bold" }}>{activeSlot.name}</Text>
            </Text>
          </View>
        )}

        {/* Calibrate button */}
        <Pressable
          style={({ pressed }) => [
            styles.calibrateBtn,
            {
              backgroundColor: "#7C3AED",
              opacity: pressed ? 0.8 : 1,
              shadowColor: "#7C3AED",
              shadowOpacity: 0.5,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
            },
          ]}
          onPress={() => setCalibrating(true)}
        >
          <MaterialCommunityIcons name="tune-variant" size={22} color="#fff" />
          <Text style={styles.calibrateBtnText}>Calibrate</Text>
        </Pressable>

        {/* Saved Calibrations */}
        <View style={[styles.slotsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.slotsTitle, { color: colors.foreground }]}>Saved Calibrations</Text>
          <Text style={[styles.slotsSubtitle, { color: colors.mutedForeground }]}>
            Tap a name to rename it. Use to switch active calibration.
          </Text>

          <View style={styles.slotList}>
            {slots.map((slot, i) => (
              <View key={slot.id}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.slotRow}>
                  {/* Name area */}
                  <Pressable
                    style={styles.slotNameArea}
                    onPress={() => handleEditStart(slot)}
                    disabled={slot.isDefault || editingId === slot.id}
                  >
                    {editingId === slot.id ? (
                      <TextInput
                        value={editValue}
                        onChangeText={setEditValue}
                        onBlur={handleEditDone}
                        onSubmitEditing={handleEditDone}
                        autoFocus
                        style={[styles.nameEditInput, { color: colors.foreground, borderColor: "#7C3AED" }]}
                        selectTextOnFocus
                      />
                    ) : (
                      <View style={styles.slotNameRow}>
                        <Text style={[styles.slotName, { color: colors.foreground }]}>
                          {slot.name}
                          {slot.isActive ? (
                            <Text style={{ color: "#a78bfa" }}> ACTIVE</Text>
                          ) : null}
                        </Text>
                        {!slot.isDefault && (
                          <Feather name="edit-2" size={11} color={colors.mutedForeground} style={{ marginLeft: 5 }} />
                        )}
                      </View>
                    )}
                    {slot.timestamp ? (
                      <Text style={[styles.slotTimestamp, { color: colors.mutedForeground }]}>
                        {slot.timestamp}
                      </Text>
                    ) : (
                      <Text style={[styles.slotTimestamp, { color: colors.mutedForeground }]}>
                        Factory default
                      </Text>
                    )}
                  </Pressable>

                  {/* Actions */}
                  <View style={styles.slotActions}>
                    <Pressable
                      style={({ pressed }) => ({ opacity: slot.isActive ? 0.3 : pressed ? 0.6 : 1 })}
                      onPress={() => !slot.isActive && handleUse(slot.id)}
                      disabled={slot.isActive}
                    >
                      <Text style={[styles.actionText, { color: "#a78bfa" }]}>USE</Text>
                    </Pressable>
                    {!slot.isDefault && (
                      <Pressable
                        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                        onPress={() => handleDelete(slot.id)}
                      >
                        <Text style={[styles.actionText, { color: "#ef4444" }]}>DEL</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Sensor settings */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sensor Settings</Text>
        {[
          { label: "IMU Sensitivity", value: "High", accent: "#a78bfa" },
          { label: "Finger Bend Threshold", value: "12°", accent: "#06b6d4" },
        ].map((item) => (
          <View key={item.label} style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Text style={[styles.settingValue, { color: item.accent }]}>{item.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  activeSlotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  activeSlotLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  calibrateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
  },
  calibrateBtnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  slotsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  slotsTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  slotsSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: -4 },
  slotList: { gap: 0 },
  divider: { height: 1, marginVertical: 2 },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  slotNameArea: { flex: 1 },
  slotNameRow: { flexDirection: "row", alignItems: "center" },
  slotName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  slotTimestamp: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  nameEditInput: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    borderBottomWidth: 1.5,
    paddingBottom: 2,
    paddingHorizontal: 0,
  },
  slotActions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  actionText: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 4 },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  settingLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  settingValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
