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

// X=red Y=green Z=blue
const AXIS_COLORS = ["#f87171", "#4ade80", "#60a5fa"] as const;

// ─── Magnitude bar — fills toward center from the outside ────────────────────
// anchor="right" → fill sticks to right edge (used for left-glove bars)
// anchor="left"  → fill sticks to left edge  (used for right-glove bars)

function MagBar({
  value,
  maxVal,
  accent,
  anchor,
}: {
  value: number;
  maxVal: number;
  accent: string;
  anchor: "left" | "right";
}) {
  const colors = useColors();
  const pct = clamp(value / maxVal, 0, 1) * 100;

  return (
    <View
      style={[
        mag.track,
        {
          backgroundColor: colors.border,
          alignItems: anchor === "right" ? "flex-end" : "flex-start",
        },
      ]}
    >
      <View
        style={[
          mag.fill,
          {
            width: `${pct}%` as any,
            backgroundColor: accent,
            shadowColor: accent,
            shadowOpacity: 0.55,
            shadowRadius: 6,
          },
        ]}
      />
    </View>
  );
}

const mag = StyleSheet.create({
  track: { flex: 1, height: 7, borderRadius: 4, overflow: "hidden" },
  fill:  { height: "100%" as any, borderRadius: 4 },
});

// ─── Bipolar bar — two halves with a center tick ─────────────────────────────
// Negative half fills from center leftward (alignItems: flex-end on left half)
// Positive half fills from center rightward (alignItems: flex-start on right half)

function BiBar({
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
  const isPos = value >= 0;

  return (
    <View style={bi.row}>
      {/* Negative half — fill sticks to the right (toward center) */}
      <View style={[bi.half, { backgroundColor: colors.border, alignItems: "flex-end" }]}>
        <View
          style={[
            bi.fill,
            {
              width: `${!isPos ? pct : 0}%` as any,
              backgroundColor: color,
              opacity: 0.75,
            },
          ]}
        />
      </View>

      {/* Center tick */}
      <View style={[bi.tick, { backgroundColor: "rgba(255,255,255,0.25)" }]} />

      {/* Positive half — fill sticks to the left (toward center) */}
      <View style={[bi.half, { backgroundColor: colors.border, alignItems: "flex-start" }]}>
        <View
          style={[
            bi.fill,
            {
              width: `${isPos ? pct : 0}%` as any,
              backgroundColor: color,
              shadowColor: color,
              shadowOpacity: pct > 10 ? 0.55 : 0,
              shadowRadius: 4,
            },
          ]}
        />
      </View>
    </View>
  );
}

const bi = StyleSheet.create({
  row:  { flex: 1, flexDirection: "row", alignItems: "center" },
  half: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%" as any, borderRadius: 3 },
  tick: { width: 2, height: 10, borderRadius: 1 },
});

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  const colors = useColors();
  return <View style={[div.line, { backgroundColor: colors.border }]} />;
}

const div = StyleSheet.create({ line: { height: 1, borderRadius: 1 } });

// ─── SensorHUD ────────────────────────────────────────────────────────────────

interface Props {
  leftAccent?: string;
  rightAccent?: string;
}

const AXES = ["x", "y", "z"] as const;

export function SensorHUD({ leftAccent = "#a78bfa", rightAccent = "#06b6d4" }: Props) {
  const { leftHand, rightHand } = useGlove();
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const lA = leftHand.accel;
  const rA = rightHand.accel;
  const lG = leftHand.gyro;
  const rG = rightHand.gyro;

  const lAMag = Math.sqrt(lA.x * lA.x + lA.y * lA.y + lA.z * lA.z);
  const rAMag = Math.sqrt(rA.x * rA.x + rA.y * rA.y + rA.z * rA.z);
  const lGMag = Math.sqrt(lG.x * lG.x + lG.y * lG.y + lG.z * lG.z);
  const rGMag = Math.sqrt(rG.x * rG.x + rG.y * rG.y + rG.z * rG.z);

  return (
    <View style={{ gap: 8 }}>
      {/* Original 4-column HUD */}
      <View style={[s.hudRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FingerBendDisplay     hand={leftHand}  side="L" accentColor={leftAccent} />
        <IMUOrientationDisplay hand={leftHand}  side="L" accentColor={leftAccent} />
        <IMUOrientationDisplay hand={rightHand} side="R" accentColor={rightAccent} />
        <FingerBendDisplay     hand={rightHand} side="R" accentColor={rightAccent} />
      </View>

      {/* ── Unified IMU widget ─────────────────────────────────────────── */}
      <View style={[s.widget, { backgroundColor: colors.card, borderColor: colors.border }]}>

        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.gloveTag}>
            <View style={[s.dot, { backgroundColor: leftAccent }]} />
            <Text style={[s.gloveLabel, { color: leftAccent }]}>LEFT GLOVE</Text>
          </View>
          <View style={s.gloveTag}>
            <Text style={[s.gloveLabel, { color: rightAccent }]}>RIGHT GLOVE</Text>
            <View style={[s.dot, { backgroundColor: rightAccent }]} />
          </View>
        </View>

        <Divider />

        {/* Magnitude rows */}
        <View style={s.magSection}>
          {/* Accel magnitude */}
          <View style={s.magRow}>
            <Text style={[s.magVal, { color: leftAccent, textAlign: "left" }]}>
              {lAMag.toFixed(2)}
            </Text>
            <MagBar value={lAMag} maxVal={2.5} accent={leftAccent}  anchor="right" />
            <Text style={[s.centerTag, { color: colors.mutedForeground }]}>A</Text>
            <MagBar value={rAMag} maxVal={2.5} accent={rightAccent} anchor="left" />
            <Text style={[s.magVal, { color: rightAccent, textAlign: "right" }]}>
              {rAMag.toFixed(2)}
            </Text>
          </View>

          {/* Gyro magnitude */}
          <View style={s.magRow}>
            <Text style={[s.magVal, { color: leftAccent, textAlign: "left" }]}>
              {lGMag.toFixed(0)}
            </Text>
            <MagBar value={lGMag} maxVal={400} accent={leftAccent}  anchor="right" />
            <Text style={[s.centerTag, { color: colors.mutedForeground }]}>G</Text>
            <MagBar value={rGMag} maxVal={400} accent={rightAccent} anchor="left" />
            <Text style={[s.magVal, { color: rightAccent, textAlign: "right" }]}>
              {rGMag.toFixed(0)}
            </Text>
          </View>
        </View>

        {/* ── Expanded detail ──────────────────────────────────────────── */}
        {expanded && (
          <>
            <Divider />

            {/* ACCEL section */}
            <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>ACCEL</Text>
            {AXES.map((ax, i) => (
              <View key={`a-${ax}`} style={s.axisRow}>
                <BiBar value={lA[ax]} maxVal={2}   color={AXIS_COLORS[i]} />
                <Text style={[s.axisLabel, { color: AXIS_COLORS[i] }]}>{ax.toUpperCase()}</Text>
                <BiBar value={rA[ax]} maxVal={2}   color={AXIS_COLORS[i]} />
              </View>
            ))}

            {/* GYRO section */}
            <Text style={[s.sectionTitle, { color: colors.mutedForeground, marginTop: 6 }]}>GYRO</Text>
            {AXES.map((ax, i) => (
              <View key={`g-${ax}`} style={s.axisRow}>
                <BiBar value={lG[ax]} maxVal={300} color={AXIS_COLORS[i]} />
                <Text style={[s.axisLabel, { color: AXIS_COLORS[i] }]}>{ax.toUpperCase()}</Text>
                <BiBar value={rG[ax]} maxVal={300} color={AXIS_COLORS[i]} />
              </View>
            ))}
          </>
        )}

        <Divider />

        {/* See more / less toggle integrated inside the widget */}
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          style={({ pressed }) => [s.toggle, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={13}
            color={colors.mutedForeground}
          />
          <Text style={[s.toggleText, { color: colors.mutedForeground }]}>
            {expanded ? "See less" : "See more"}
          </Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={13}
            color={colors.mutedForeground}
          />
        </Pressable>
      </View>
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

  // Widget container
  widget: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    gap: 10,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gloveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  gloveLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.1,
  },

  // Magnitude
  magSection: { gap: 8 },
  magRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  magVal: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    width: 30,
  },
  centerTag: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    width: 14,
    textAlign: "center",
  },

  // Expanded
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
  },
  axisRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  axisLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    width: 14,
    textAlign: "center",
  },

  // Toggle
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  toggleText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
