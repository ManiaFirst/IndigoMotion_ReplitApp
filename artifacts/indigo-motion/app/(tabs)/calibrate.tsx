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

const PHASES: {
  id: CalibPhase;
  label: string;
  instruction: string;
  duration: number;
  color: string;
  icon: string;
}[] = [
  {
    id: "prepare",
    label: "Get Ready",
    instruction: "Keep your hands still and relaxed.",
    duration: 5,
    color: "#a78bfa",
    icon: "hand-wave",
  },
  {
    id: "bend",
    label: "Bend Fingers",
    instruction: "Curl all fingers into a tight fist and hold.",
    duration: 7,
    color: "#06b6d4",
    icon: "fist",
  },
  {
    id: "stretch",
    label: "Stretch Fingers",
    instruction: "Spread all fingers as wide as possible and hold.",
    duration: 7,
    color: "#22c55e",
    icon: "hand-back-right",
  },
  {
    id: "done",
    label: "All Done!",
    instruction: "Your gloves are calibrated and ready to use.",
    duration: 0,
    color: "#22c55e",
    icon: "check-circle-outline",
  },
];

// ─── Circular countdown — rotating dot on track ring ─────────────────────────

function CircularCountdown({
  progress, // 1 = full time remaining → 0 = expired
  countdown,
  color,
  size = 160,
}: {
  progress: number;
  countdown: number;
  color: string;
  size: number;
}) {
  const strokeW = 7;
  const dotSize = 14;
  const p = Math.max(0, Math.min(1, progress));

  // Rotate the dot around the ring — starts at top (0°), sweeps clockwise
  const rotateDeg = (1 - p) * 360;

  // Number scale pop on each tick
  const numScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(numScale, {
        toValue: 1.18,
        duration: 70,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(numScale, {
        toValue: 1,
        duration: 130,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start();
  }, [countdown]);

  // Outer glow pulse
  const glow = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(glow, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
    return () => glow.stopAnimation();
  }, [color]);

  const radius = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* Glow halo behind ring */}
      <Animated.View
        style={{
          position: "absolute",
          width: size + 20,
          height: size + 20,
          borderRadius: (size + 20) / 2,
          backgroundColor: `${color}10`,
          opacity: glow,
        }}
      />

      {/* Track ring */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: strokeW,
          borderColor: `${color}22`,
        }}
      />

      {/* Rotating dot — placed at top-center of the ring, rotates around it */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          alignItems: "center",
          transform: [{ rotate: `${rotateDeg}deg` }],
        }}
      >
        {/* Dot sits right on the top edge of the ring */}
        <View
          style={{
            marginTop: strokeW / 2 - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      </View>

      {/* Center countdown number */}
      <Animated.Text
        style={{
          fontSize: 52,
          fontFamily: "Inter_700Bold",
          color,
          transform: [{ scale: numScale }],
          textShadowColor: color,
          textShadowRadius: 14,
          textShadowOffset: { width: 0, height: 0 },
        }}
      >
        {countdown}
      </Animated.Text>
    </View>
  );
}

// ─── Phase indicator bar ──────────────────────────────────────────────────────

function PhaseBar({ currentPhaseIdx }: { currentPhaseIdx: number }) {
  const colors = useColors();
  const displayPhases = PHASES.slice(0, 3);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      {displayPhases.map((ph, i) => {
        const done = i < currentPhaseIdx;
        const active = i === currentPhaseIdx;
        return (
          <View key={ph.id} style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: done
                  ? `${ph.color}30`
                  : active
                  ? `${ph.color}22`
                  : `${colors.border}60`,
                borderWidth: active ? 1.5 : done ? 1 : 0,
                borderColor: active || done ? ph.color : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_600SemiBold",
                  color: done || active ? ph.color : colors.mutedForeground,
                }}
              >
                {ph.label}
              </Text>
            </View>
            {i < displayPhases.length - 1 && (
              <View
                style={{
                  width: 14,
                  height: 1.5,
                  marginHorizontal: 3,
                  backgroundColor: done ? displayPhases[i + 1].color : colors.border,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Calibration card popup ───────────────────────────────────────────────────

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
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [newName, setNewName] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const countRef = useRef(PHASES[0].duration);

  const phase = PHASES[phaseIdx];
  const isDone = phase.id === "done";

  // Card slide-in
  const slideY = useRef(new Animated.Value(60)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Reset state
    phaseRef.current = 0;
    countRef.current = PHASES[0].duration;
    setPhaseIdx(0);
    setCountdown(PHASES[0].duration);
    setNewName(
      `Calib ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`
    );

    // Animate card in
    slideY.setValue(60);
    fadeIn.setValue(0);
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Start countdown timer
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const progress = phase.duration > 0 ? countdown / phase.duration : 1;

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Backdrop */}
      <Animated.View
        style={[mStyles.backdrop, { opacity: fadeIn }]}
        pointerEvents="none"
      />

      {/* Centered card */}
      <View style={mStyles.overlay}>
        <Animated.View
          style={[
            mStyles.card,
            {
              backgroundColor: colors.card,
              borderColor: `${phase.color}30`,
              transform: [{ translateY: slideY }],
              opacity: fadeIn,
            },
          ]}
        >
          {/* Close button */}
          {!isDone && (
            <Pressable onPress={onCancel} style={mStyles.closeBtn} hitSlop={12}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}

          {/* Phase bar */}
          <PhaseBar currentPhaseIdx={phaseIdx} />

          {/* Icon */}
          <View style={[mStyles.iconWrap, { backgroundColor: `${phase.color}18` }]}>
            <MaterialCommunityIcons
              name={phase.icon as any}
              size={30}
              color={phase.color}
            />
          </View>

          {/* Phase label */}
          <Text style={[mStyles.phaseLabel, { color: phase.color }]}>{phase.label}</Text>

          {/* Circular countdown OR done ring */}
          {!isDone ? (
            <CircularCountdown
              progress={progress}
              countdown={countdown}
              color={phase.color}
              size={160}
            />
          ) : (
            <View
              style={[
                mStyles.doneRing,
                { borderColor: phase.color, shadowColor: phase.color },
              ]}
            >
              <MaterialCommunityIcons name="check" size={56} color={phase.color} />
            </View>
          )}

          {/* Instruction */}
          <Text style={[mStyles.instruction, { color: colors.mutedForeground }]}>
            {phase.instruction}
          </Text>

          {/* Name + save (done state only) */}
          {isDone && (
            <View style={mStyles.saveArea}>
              <Text style={[mStyles.saveLabel, { color: colors.foreground }]}>
                Name this calibration
              </Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                style={[
                  mStyles.nameInput,
                  {
                    backgroundColor: `${colors.background}`,
                    borderColor: phase.color,
                    color: colors.foreground,
                  },
                ]}
                placeholderTextColor={colors.mutedForeground}
                placeholder="Calibration name"
                selectTextOnFocus
              />
              <Pressable
                style={({ pressed }) => [
                  mStyles.saveBtn,
                  {
                    backgroundColor: phase.color,
                    opacity: pressed ? 0.8 : 1,
                    shadowColor: phase.color,
                  },
                ]}
                onPress={() => onComplete(newName || "Untitled")}
              >
                <Text style={mStyles.saveBtnText}>Save Calibration</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const mStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4, 1, 12, 0.82)",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 28,
    alignItems: "center",
    gap: 18,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 6,
    borderRadius: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseLabel: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  doneRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  instruction: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  saveArea: {
    width: "100%",
    gap: 10,
  },
  saveLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  nameInput: {
    width: "100%",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  saveBtn: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});

// ─── Slot row ─────────────────────────────────────────────────────────────────

function SlotRow({
  slot,
  isEditing,
  editValue,
  onEditChange,
  onEditStart,
  onEditCommit,
  onUse,
  onDelete,
}: {
  slot: CalibrationSlot;
  isEditing: boolean;
  editValue: string;
  onEditChange: (v: string) => void;
  onEditStart: () => void;
  onEditCommit: () => void;
  onUse: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();

  return (
    <View
      style={[
        sStyles.row,
        {
          backgroundColor: slot.isActive
            ? "#7C3AED14"
            : colors.background,
          borderColor: slot.isActive ? "#7C3AED40" : colors.border,
        },
      ]}
    >
      {/* Name + subtitle */}
      <View style={sStyles.nameBlock}>
        {isEditing ? (
          <View style={sStyles.editRow}>
            <TextInput
              value={editValue}
              onChangeText={onEditChange}
              onSubmitEditing={onEditCommit}
              autoFocus
              style={[
                sStyles.editInput,
                { color: colors.foreground, borderColor: "#7C3AED" },
              ]}
              selectTextOnFocus
              returnKeyType="done"
            />
            <Pressable
              onPress={onEditCommit}
              style={[sStyles.confirmBtn, { backgroundColor: "#7C3AED" }]}
              hitSlop={8}
            >
              <Feather name="check" size={14} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={slot.isDefault ? undefined : onEditStart}
            disabled={slot.isDefault}
            style={sStyles.namePressable}
            hitSlop={6}
          >
            <Text style={[sStyles.slotName, { color: colors.foreground }]}>
              {slot.name}
            </Text>
            {slot.isActive && (
              <View style={sStyles.activePill}>
                <Text style={sStyles.activeText}>ACTIVE</Text>
              </View>
            )}
            {!slot.isDefault && (
              <Feather
                name="edit-2"
                size={12}
                color={colors.mutedForeground}
                style={{ marginLeft: 6 }}
              />
            )}
          </Pressable>
        )}
        <Text style={[sStyles.timestamp, { color: colors.mutedForeground }]}>
          {slot.timestamp || "Factory default"}
        </Text>
      </View>

      {/* Actions */}
      <View style={sStyles.actions}>
        <Pressable
          onPress={onUse}
          disabled={slot.isActive}
          hitSlop={8}
          style={({ pressed }) => ({
            opacity: slot.isActive ? 0.25 : pressed ? 0.6 : 1,
          })}
        >
          <Text style={[sStyles.actionText, { color: "#a78bfa" }]}>USE</Text>
        </Pressable>
        {!slot.isDefault && (
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={[sStyles.actionText, { color: "#ef4444" }]}>DEL</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const sStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  nameBlock: { flex: 1, gap: 3 },
  namePressable: { flexDirection: "row", alignItems: "center" },
  slotName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  activePill: {
    marginLeft: 8,
    backgroundColor: "#7C3AED22",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#a78bfa" },
  timestamp: { fontSize: 11, fontFamily: "Inter_400Regular" },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  editInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    borderBottomWidth: 2,
    paddingBottom: 3,
    paddingTop: 0,
    paddingHorizontal: 2,
  },
  confirmBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: { flexDirection: "row", gap: 18, alignItems: "center" },
  actionText: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.4 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

const INITIAL_SLOTS: CalibrationSlot[] = [
  { id: "default", name: "Default",        isDefault: true,  isActive: true,  timestamp: "" },
  { id: "slot_1",  name: "Live Set A",     isDefault: false, isActive: false, timestamp: "2026-04-03" },
  { id: "slot_2",  name: "Studio Session", isDefault: false, isActive: false, timestamp: "2026-04-01" },
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

  const handleUse = (id: string) =>
    setSlots((prev) => prev.map((s) => ({ ...s, isActive: s.id === id })));

  const handleDelete = (id: string) => {
    setSlots((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (!updated.find((s) => s.isActive)) {
        return updated.map((s) => ({ ...s, isActive: s.isDefault }));
      }
      return updated;
    });
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
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Calibration</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Press Calibrate, then follow the on-screen instructions.
        </Text>

        {/* Active slot indicator */}
        {activeSlot && (
          <View style={[styles.activeBanner, { borderColor: "#7C3AED", backgroundColor: "#7C3AED14" }]}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#7C3AED" />
            <Text style={[styles.activeBannerText, { color: "#a78bfa" }]}>
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
              opacity: pressed ? 0.82 : 1,
              shadowColor: "#7C3AED",
              shadowOpacity: 0.5,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
            },
          ]}
          onPress={() => setCalibrating(true)}
        >
          <MaterialCommunityIcons name="tune-variant" size={20} color="#fff" />
          <Text style={styles.calibrateBtnText}>Calibrate</Text>
        </Pressable>

        {/* Saved calibrations */}
        <View style={[styles.slotsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.slotsTitle, { color: colors.foreground }]}>Saved Calibrations</Text>
          <Text style={[styles.slotsSubtitle, { color: colors.mutedForeground }]}>
            Tap a name to rename it. USE to switch active.
          </Text>

          <View style={styles.slotList}>
            {slots.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                isEditing={editingId === slot.id}
                editValue={editValue}
                onEditChange={setEditValue}
                onEditStart={() => {
                  setEditingId(slot.id);
                  setEditValue(slot.name);
                }}
                onEditCommit={() => {
                  setSlots((prev) =>
                    prev.map((s) =>
                      s.id === slot.id ? { ...s, name: editValue.trim() || s.name } : s
                    )
                  );
                  setEditingId(null);
                }}
                onUse={() => handleUse(slot.id)}
                onDelete={() => handleDelete(slot.id)}
              />
            ))}
          </View>
        </View>

        {/* Sensor settings */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sensor Settings</Text>
        {[
          { label: "IMU Sensitivity", value: "High", accent: "#a78bfa" },
          { label: "Finger Bend Threshold", value: "12°", accent: "#06b6d4" },
        ].map((item) => (
          <View
            key={item.label}
            style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
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
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  activeBannerText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  calibrateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    borderRadius: 18,
  },
  calibrateBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  slotsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  slotsTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  slotsSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
  slotList: { gap: 8 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginTop: 4 },
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
