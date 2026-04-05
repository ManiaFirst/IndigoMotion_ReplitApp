import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { HandState } from "@/context/GloveContext";

interface Props {
  hand: HandState;
  side: "L" | "R";
  accentColor: string;
}

export function IMUOrientationDisplay({ hand, side, accentColor }: Props) {
  const colors = useColors();
  const { pitch, roll, yaw } = hand.orientation;

  // Map pitch/roll to translate the palm indicator
  const maxOffset = 28;
  const normPitch = pitch / 90;
  const normRoll = roll / 180;
  const dotX = normRoll * maxOffset;
  const dotY = -normPitch * maxOffset;

  // Yaw indicator angle
  const yawAngle = yaw;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.side, { color: colors.mutedForeground }]}>{side} IMU</Text>
      
      {/* Horizon ball display */}
      <View style={[styles.sphere, { borderColor: colors.border }]}>
        {/* Crosshair lines */}
        <View style={[styles.crossH, { backgroundColor: colors.border }]} />
        <View style={[styles.crossV, { backgroundColor: colors.border }]} />
        {/* Roll ring indicator */}
        <View
          style={[
            styles.rollRing,
            {
              borderColor: accentColor,
              opacity: 0.35,
              transform: [{ rotate: `${yawAngle}deg` }],
            },
          ]}
        />
        {/* Moving dot for pitch/roll */}
        <View
          style={[
            styles.dot,
            {
              backgroundColor: accentColor,
              shadowColor: accentColor,
              shadowOpacity: 0.9,
              shadowRadius: 8,
              transform: [{ translateX: dotX }, { translateY: dotY }],
            },
          ]}
        />
      </View>

      {/* Numeric readouts */}
      <View style={styles.readouts}>
        <ReadoutItem label="P" value={pitch} color={accentColor} />
        <ReadoutItem label="R" value={roll} color={accentColor} />
        <ReadoutItem label="Y" value={yaw} color={accentColor} />
      </View>
    </View>
  );
}

function ReadoutItem({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.readoutItem}>
      <Text style={[styles.readoutLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.readoutValue, { color }]}>{value.toFixed(0)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  side: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  sphere: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  crossH: {
    position: "absolute",
    width: "100%",
    height: 1,
    opacity: 0.3,
  },
  crossV: {
    position: "absolute",
    width: 1,
    height: "100%",
    opacity: 0.3,
  },
  rollRing: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
  },
  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  readouts: {
    flexDirection: "row",
    gap: 8,
  },
  readoutItem: {
    alignItems: "center",
    gap: 1,
  },
  readoutLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
  },
  readoutValue: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
