import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useGlove } from "@/context/GloveContext";
import { useColors } from "@/hooks/useColors";
import type { HandState, FingerName } from "@/context/GloveContext";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FINGER_ORDER: FingerName[] = ["thumb", "index", "middle", "ring", "pinky"];
const FINGER_LABELS: Record<FingerName, string> = {
  thumb: "T", index: "I", middle: "M", ring: "R", pinky: "P",
};

// Axis label colors (X=red-ish, Y=green-ish, Z=blue-ish, always visible on dark)
const AXIS_COLORS = {
  x: "#f87171",
  y: "#4ade80",
  z: "#60a5fa",
};

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ─── Finger bend bars (vertical) ─────────────────────────────────────────────

function FingerBars({ hand, accent }: { hand: HandState; accent: string }) {
  const colors = useColors();
  return (
    <View style={fb.wrap}>
      <Text style={[fb.label, { color: colors.mutedForeground }]}>FINGERS</Text>
      <View style={fb.bars}>
        {FINGER_ORDER.map((f) => {
          const pct = clamp(hand.fingers[f].bend, 0, 1);
          return (
            <View key={f} style={fb.col}>
              <View style={[fb.track, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    fb.fill,
                    {
                      height: `${pct * 100}%` as any,
                      backgroundColor: accent,
                      shadowColor: accent,
                      shadowOpacity: 0.7,
                      shadowRadius: 4,
                    },
                  ]}
                />
              </View>
              <Text style={[fb.lbl, { color: colors.mutedForeground }]}>
                {FINGER_LABELS[f]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const fb = StyleSheet.create({
  wrap: { alignItems: "center", gap: 4 },
  label: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  bars: { flexDirection: "row", gap: 5, alignItems: "flex-end", height: 52 },
  col: { alignItems: "center", gap: 3 },
  track: { width: 9, height: 44, borderRadius: 4, justifyContent: "flex-end", overflow: "hidden" },
  fill: { width: "100%", borderRadius: 4 },
  lbl: { fontSize: 8, fontFamily: "Inter_500Medium" },
});

// ─── IMU orientation sphere ───────────────────────────────────────────────────

function OrientationSphere({
  hand,
  accent,
}: {
  hand: HandState;
  accent: string;
}) {
  const colors = useColors();
  const { pitch, roll, yaw } = hand.orientation;
  const maxOffset = 22;
  const dotX = clamp(roll / 180, -1, 1) * maxOffset;
  const dotY = -clamp(pitch / 90, -1, 1) * maxOffset;

  return (
    <View style={sp.wrap}>
      <Text style={[sp.label, { color: colors.mutedForeground }]}>ORIENT</Text>
      <View style={[sp.sphere, { borderColor: colors.border }]}>
        <View style={[sp.crossH, { backgroundColor: colors.border }]} />
        <View style={[sp.crossV, { backgroundColor: colors.border }]} />
        {/* Yaw ring */}
        <View
          style={[
            sp.ring,
            {
              borderColor: accent,
              opacity: 0.3,
              transform: [{ rotate: `${yaw}deg` }],
            },
          ]}
        />
        {/* Pitch/roll dot */}
        <View
          style={[
            sp.dot,
            {
              backgroundColor: accent,
              shadowColor: accent,
              shadowOpacity: 0.9,
              shadowRadius: 7,
              transform: [{ translateX: dotX }, { translateY: dotY }],
            },
          ]}
        />
      </View>
      {/* P / R / Y numeric */}
      <View style={sp.nums}>
        {([
          ["P", pitch],
          ["R", roll],
          ["Y", yaw],
        ] as [string, number][]).map(([l, v]) => (
          <View key={l} style={sp.numItem}>
            <Text style={[sp.numLabel, { color: colors.mutedForeground }]}>{l}</Text>
            <Text style={[sp.numValue, { color: accent }]}>{v.toFixed(0)}°</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const sp = StyleSheet.create({
  wrap: { alignItems: "center", gap: 4 },
  label: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  sphere: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  crossH: { position: "absolute", width: "100%", height: 1, opacity: 0.3 },
  crossV: { position: "absolute", width: 1, height: "100%", opacity: 0.3 },
  ring: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nums: { flexDirection: "row", gap: 6 },
  numItem: { alignItems: "center", gap: 1 },
  numLabel: { fontSize: 8, fontFamily: "Inter_500Medium" },
  numValue: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});

// ─── Bipolar axis bar (–max … 0 … +max) ──────────────────────────────────────

function AxisBar({
  label,
  value,
  maxVal,
  color,
  unit,
}: {
  label: string;
  value: number;
  maxVal: number;
  color: string;
  unit: string;
}) {
  const colors = useColors();
  const pct = clamp(Math.abs(value) / maxVal, 0, 1);
  const isPos = value >= 0;

  return (
    <View style={ab.row}>
      <Text style={[ab.axis, { color }]}>{label}</Text>

      {/* Negative half */}
      <View style={[ab.halfTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            ab.halfFill,
            {
              width: isPos ? 0 : `${pct * 100}%` as any,
              backgroundColor: color,
              alignSelf: "flex-start",
              opacity: 0.7,
            },
          ]}
        />
      </View>

      {/* Center tick */}
      <View style={[ab.centerTick, { backgroundColor: colors.mutedForeground }]} />

      {/* Positive half */}
      <View style={[ab.halfTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            ab.halfFill,
            {
              width: isPos ? `${pct * 100}%` as any : 0,
              backgroundColor: color,
              alignSelf: "flex-start",
              shadowColor: color,
              shadowOpacity: pct > 0.3 ? 0.6 : 0,
              shadowRadius: 4,
            },
          ]}
        />
      </View>

      {/* Numeric */}
      <Text style={[ab.value, { color }]}>
        {value > 0 ? "+" : ""}{value.toFixed(2)}{unit}
      </Text>
    </View>
  );
}

const ab = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 5 },
  axis: { fontSize: 9, fontFamily: "Inter_700Bold", width: 10 },
  halfTrack: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  halfFill: { height: "100%", borderRadius: 3 },
  centerTick: { width: 1.5, height: 9, borderRadius: 1, opacity: 0.5 },
  value: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    width: 52,
    textAlign: "right",
  },
});

// ─── Motion magnitude bar ─────────────────────────────────────────────────────

function MagnitudeBar({
  value,
  maxVal,
  accent,
  label,
  unit,
}: {
  value: number;
  maxVal: number;
  accent: string;
  label: string;
  unit: string;
}) {
  const colors = useColors();
  const pct = clamp(value / maxVal, 0, 1);

  return (
    <View style={mg.row}>
      <Text style={[mg.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[mg.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            mg.fill,
            {
              width: `${pct * 100}%` as any,
              backgroundColor: accent,
              shadowColor: accent,
              shadowOpacity: 0.7,
              shadowRadius: 8,
            },
          ]}
        />
      </View>
      <Text style={[mg.value, { color: accent }]}>
        {value.toFixed(2)}{unit}
      </Text>
    </View>
  );
}

const mg = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 9, fontFamily: "Inter_600SemiBold", width: 36, letterSpacing: 0.5 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  value: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    width: 56,
    textAlign: "right",
  },
});

// ─── Per-glove panel ──────────────────────────────────────────────────────────

function GlovePanel({
  hand,
  side,
  accent,
}: {
  hand: HandState;
  side: "L" | "R";
  accent: string;
}) {
  const colors = useColors();
  const { accel, gyro } = hand;

  const accelMag = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
  const gyroMag  = Math.sqrt(gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2);

  const sideLabel = side === "L" ? "LEFT GLOVE" : "RIGHT GLOVE";

  return (
    <View
      style={[
        gp.card,
        {
          backgroundColor: colors.card,
          borderColor: `${accent}30`,
        },
      ]}
    >
      {/* Header */}
      <View style={gp.header}>
        <View style={gp.headerLeft}>
          <View style={[gp.dot, { backgroundColor: hand.connected ? "#22c55e" : "#ef4444" }]} />
          <Text style={[gp.sideLabel, { color: accent }]}>{sideLabel}</Text>
        </View>
        <View style={[gp.battBadge, { backgroundColor: `${accent}18` }]}>
          <Text style={[gp.battText, { color: accent }]}>BAT {hand.battery}%</Text>
        </View>
      </View>

      {/* Fingers + Orientation side by side */}
      <View style={gp.topRow}>
        <FingerBars hand={hand} accent={accent} />
        <View style={[gp.divider, { backgroundColor: colors.border }]} />
        <OrientationSphere hand={hand} accent={accent} />
      </View>

      {/* Separator */}
      <View style={[gp.separator, { backgroundColor: colors.border }]} />

      {/* Accelerometer */}
      <View style={gp.sectionBlock}>
        <Text style={[gp.sectionTitle, { color: colors.mutedForeground }]}>ACCEL</Text>
        <AxisBar label="X" value={accel.x} maxVal={2}   color={AXIS_COLORS.x} unit="g" />
        <AxisBar label="Y" value={accel.y} maxVal={2}   color={AXIS_COLORS.y} unit="g" />
        <AxisBar label="Z" value={accel.z} maxVal={2}   color={AXIS_COLORS.z} unit="g" />
      </View>

      {/* Gyroscope */}
      <View style={gp.sectionBlock}>
        <Text style={[gp.sectionTitle, { color: colors.mutedForeground }]}>GYRO</Text>
        <AxisBar label="X" value={gyro.x} maxVal={300} color={AXIS_COLORS.x} unit="°/s" />
        <AxisBar label="Y" value={gyro.y} maxVal={300} color={AXIS_COLORS.y} unit="°/s" />
        <AxisBar label="Z" value={gyro.z} maxVal={300} color={AXIS_COLORS.z} unit="°/s" />
      </View>

      {/* Motion magnitude */}
      <View style={[gp.separator, { backgroundColor: colors.border }]} />
      <View style={gp.sectionBlock}>
        <Text style={[gp.sectionTitle, { color: colors.mutedForeground }]}>MAGNITUDE</Text>
        <MagnitudeBar value={accelMag} maxVal={2.5} accent={accent} label="ACCEL" unit="g" />
        <MagnitudeBar value={gyroMag}  maxVal={400} accent={accent} label="GYRO"  unit="°/s" />
      </View>
    </View>
  );
}

const gp = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  sideLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  battBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  battText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    gap: 12,
  },
  divider: { width: 1, alignSelf: "stretch", marginTop: 16 },
  separator: { height: 1, borderRadius: 1 },
  sectionBlock: { gap: 5 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 1,
  },
});

// ─── SensorHUD ────────────────────────────────────────────────────────────────

interface Props {
  leftAccent?: string;
  rightAccent?: string;
}

export function SensorHUD({
  leftAccent = "#a78bfa",
  rightAccent = "#06b6d4",
}: Props) {
  const { leftHand, rightHand } = useGlove();

  return (
    <View style={{ gap: 10 }}>
      <GlovePanel hand={leftHand}  side="L" accent={leftAccent} />
      <GlovePanel hand={rightHand} side="R" accent={rightAccent} />
    </View>
  );
}
