import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useGlove } from "@/context/GloveContext";
import { useColors } from "@/hooks/useColors";
import { FingerBendDisplay } from "@/components/FingerBendDisplay";
import { IMUOrientationDisplay } from "@/components/IMUOrientationDisplay";
import type { HandState } from "@/context/GloveContext";

// ─── Compact per-glove motion summary ────────────────────────────────────────

function MotionSummary({
  hand,
  accent,
  label,
}: {
  hand: HandState;
  accent: string;
  label: string;
}) {
  const colors = useColors();
  const { accel, gyro } = hand;

  const accelMag = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
  const gyroMag  = Math.sqrt(gyro.x  ** 2 + gyro.y  ** 2 + gyro.z  ** 2);

  const fmt1 = (v: number) => (v >= 0 ? "+" : "") + v.toFixed(2);
  const fmtG = (v: number) => (v >= 0 ? "+" : "") + v.toFixed(0);

  return (
    <View style={[ms.card, { backgroundColor: colors.card, borderColor: `${accent}30` }]}>
      {/* Glove label */}
      <Text style={[ms.gloveLabel, { color: accent }]}>{label}</Text>

      {/* Magnitude — the big number */}
      <View style={ms.magRow}>
        <Text style={[ms.magValue, { color: accent }]}>{accelMag.toFixed(2)}</Text>
        <Text style={[ms.magUnit, { color: colors.mutedForeground }]}>g</Text>
        <View style={[ms.magDivider, { backgroundColor: colors.border }]} />
        <Text style={[ms.magValue, { color: accent }]}>{gyroMag.toFixed(0)}</Text>
        <Text style={[ms.magUnit, { color: colors.mutedForeground }]}>°/s</Text>
      </View>

      {/* Accel xyz — compact */}
      <View style={ms.axisRow}>
        <Text style={[ms.axisTag, { color: colors.mutedForeground }]}>A</Text>
        <Text style={[ms.axisVals, { color: colors.mutedForeground }]}>
          <Text style={{ color: "#f87171" }}>{fmt1(accel.x)}</Text>
          {"  "}
          <Text style={{ color: "#4ade80" }}>{fmt1(accel.y)}</Text>
          {"  "}
          <Text style={{ color: "#60a5fa" }}>{fmt1(accel.z)}</Text>
        </Text>
      </View>

      {/* Gyro xyz — compact */}
      <View style={ms.axisRow}>
        <Text style={[ms.axisTag, { color: colors.mutedForeground }]}>G</Text>
        <Text style={[ms.axisVals, { color: colors.mutedForeground }]}>
          <Text style={{ color: "#f87171" }}>{fmtG(gyro.x)}</Text>
          {"  "}
          <Text style={{ color: "#4ade80" }}>{fmtG(gyro.y)}</Text>
          {"  "}
          <Text style={{ color: "#60a5fa" }}>{fmtG(gyro.z)}</Text>
        </Text>
      </View>
    </View>
  );
}

const ms = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 10,
    gap: 6,
  },
  gloveLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  magRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  magValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  magUnit: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    marginBottom: 1,
  },
  magDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 4,
    alignSelf: "center",
  },
  axisRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  axisTag: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    width: 10,
  },
  axisVals: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
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
  const colors = useColors();

  return (
    <View style={{ gap: 8 }}>
      {/* Original 4-column HUD: L fingers | L IMU | R IMU | R fingers */}
      <View
        style={[
          styles.hudRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <FingerBendDisplay hand={leftHand}  side="L" accentColor={leftAccent} />
        <IMUOrientationDisplay hand={leftHand}  side="L" accentColor={leftAccent} />
        <IMUOrientationDisplay hand={rightHand} side="R" accentColor={rightAccent} />
        <FingerBendDisplay hand={rightHand} side="R" accentColor={rightAccent} />
      </View>

      {/* Simple side-by-side motion summary */}
      <View style={styles.summaryRow}>
        <MotionSummary hand={leftHand}  accent={leftAccent}  label="Left Glove" />
        <MotionSummary hand={rightHand} accent={rightAccent} label="Right Glove" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hudRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    flexDirection: "row",
    gap: 6,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
});
