import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useGlove } from "@/context/GloveContext";
import { useColors } from "@/hooks/useColors";
import { FingerBendDisplay } from "@/components/FingerBendDisplay";
import { IMUOrientationDisplay } from "@/components/IMUOrientationDisplay";
import type { HandState } from "@/context/GloveContext";

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const AXIS_COLORS = ["#f87171", "#4ade80", "#60a5fa"] as const;

// ─── Simple fill bar (unipolar, 0 → max) ─────────────────────────────────────

function FillBar({
  value,
  maxVal,
  color,
}: {
  value: number;
  maxVal: number;
  color: string;
}) {
  const colors = useColors();
  const pct = clamp(Math.abs(value) / maxVal, 0, 1) * 100;

  return (
    <View style={[fb.track, { backgroundColor: colors.border }]}>
      <View
        style={[
          fb.fill,
          {
            width: `${pct}%` as any,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.5,
            shadowRadius: 4,
          },
        ]}
      />
    </View>
  );
}

const fb = StyleSheet.create({
  track: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  fill:  { height: "100%" as any, borderRadius: 3 },
});

// ─── Axis triplet (X / Y / Z bars) ───────────────────────────────────────────

function AxisTriplet({
  data,
  maxVal,
  title,
}: {
  data: { x: number; y: number; z: number };
  maxVal: number;
  title: string;
}) {
  const colors = useColors();
  const axes = [
    { key: "x" as const, label: "X" },
    { key: "y" as const, label: "Y" },
    { key: "z" as const, label: "Z" },
  ];
  return (
    <View style={at.wrap}>
      <Text style={[at.title, { color: colors.mutedForeground }]}>{title}</Text>
      {axes.map((ax, i) => (
        <View key={ax.key} style={at.row}>
          <Text style={[at.sign, { color: AXIS_COLORS[i], opacity: 0.6 }]}>
            {data[ax.key] >= 0 ? "+" : "−"}
          </Text>
          <FillBar value={data[ax.key]} maxVal={maxVal} color={AXIS_COLORS[i]} />
        </View>
      ))}
    </View>
  );
}

const at = StyleSheet.create({
  wrap: { gap: 5 },
  title: { fontSize: 8, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  row:   { flexDirection: "row", alignItems: "center", gap: 5 },
  sign:  { fontSize: 9, fontFamily: "Inter_700Bold", width: 8 },
});

// ─── Magnitude bar ────────────────────────────────────────────────────────────

function MagBar({
  value,
  maxVal,
  accent,
  label,
}: {
  value: number;
  maxVal: number;
  accent: string;
  label: string;
}) {
  const colors = useColors();
  const pct = clamp(value / maxVal, 0, 1) * 100;

  return (
    <View style={mb.row}>
      <Text style={[mb.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[mb.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            mb.fill,
            {
              width: `${pct}%` as any,
              backgroundColor: accent,
              shadowColor: accent,
              shadowOpacity: 0.6,
              shadowRadius: 6,
            },
          ]}
        />
      </View>
      <Text style={[mb.value, { color: accent }]}>{value.toFixed(2)}</Text>
    </View>
  );
}

const mb = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", gap: 7 },
  label: { fontSize: 9, fontFamily: "Inter_600SemiBold", width: 12, letterSpacing: 0.5 },
  track: { flex: 1, height: 7, borderRadius: 4, overflow: "hidden" },
  fill:  { height: "100%" as any, borderRadius: 4 },
  value: { fontSize: 10, fontFamily: "Inter_700Bold", width: 34, textAlign: "right" },
});

// ─── Per-glove panel ──────────────────────────────────────────────────────────

function GlovePanel({
  hand,
  accent,
  label,
  expanded,
}: {
  hand: HandState;
  accent: string;
  label: string;
  expanded: boolean;
}) {
  const colors = useColors();
  const { accel, gyro } = hand;

  const accelMag = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
  const gyroMag  = Math.sqrt(gyro.x  * gyro.x  + gyro.y  * gyro.y  + gyro.z  * gyro.z);

  return (
    <View style={[gp.card, { backgroundColor: colors.card, borderColor: `${accent}28` }]}>
      <Text style={[gp.label, { color: accent }]}>{label}</Text>

      <MagBar value={accelMag} maxVal={2.5} accent={accent} label="A" />
      <MagBar value={gyroMag}  maxVal={400} accent={accent} label="G" />

      {expanded && (
        <View style={[gp.extra, { borderTopColor: colors.border }]}>
          <AxisTriplet data={accel} maxVal={2}   title="ACCEL" />
          <AxisTriplet data={gyro}  maxVal={300}  title="GYRO" />
        </View>
      )}
    </View>
  );
}

const gp = StyleSheet.create({
  card:  { flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 10, gap: 7 },
  label: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  extra: { borderTopWidth: 1, paddingTop: 9, gap: 10 },
});

// ─── SensorHUD ────────────────────────────────────────────────────────────────

interface Props {
  leftAccent?: string;
  rightAccent?: string;
}

export function SensorHUD({ leftAccent = "#a78bfa", rightAccent = "#06b6d4" }: Props) {
  const { leftHand, rightHand } = useGlove();
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={{ gap: 8 }}>
      {/* Original 4-column HUD */}
      <View style={[s.hudRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FingerBendDisplay     hand={leftHand}  side="L" accentColor={leftAccent} />
        <IMUOrientationDisplay hand={leftHand}  side="L" accentColor={leftAccent} />
        <IMUOrientationDisplay hand={rightHand} side="R" accentColor={rightAccent} />
        <FingerBendDisplay     hand={rightHand} side="R" accentColor={rightAccent} />
      </View>

      {/* Side-by-side magnitude + optional detail */}
      <View style={s.panelRow}>
        <GlovePanel hand={leftHand}  accent={leftAccent}  label="LEFT GLOVE"  expanded={expanded} />
        <GlovePanel hand={rightHand} accent={rightAccent} label="RIGHT GLOVE" expanded={expanded} />
      </View>

      {/* Toggle */}
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        style={({ pressed }) => [
          s.toggle,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[s.toggleText, { color: colors.mutedForeground }]}>
          {expanded ? "See less" : "See more"}
        </Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={12}
          color={colors.mutedForeground}
        />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  hudRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    flexDirection: "row",
    gap: 6,
  },
  panelRow: { flexDirection: "row", gap: 8 },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "center",
  },
  toggleText: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
