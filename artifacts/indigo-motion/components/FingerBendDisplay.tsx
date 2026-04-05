import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { HandState, FingerName } from "@/context/GloveContext";

const FINGER_LABELS: Record<FingerName, string> = {
  thumb: "T",
  index: "I",
  middle: "M",
  ring: "R",
  pinky: "P",
};

const FINGER_ORDER: FingerName[] = ["thumb", "index", "middle", "ring", "pinky"];

function FingerBar({ bend, label, accentColor }: { bend: number; label: string; accentColor: string }) {
  const colors = useColors();
  const pct = Math.max(0, Math.min(1, bend));
  return (
    <View style={styles.fingerCol}>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.fill,
            {
              height: `${pct * 100}%` as any,
              backgroundColor: accentColor,
              shadowColor: accentColor,
              shadowOpacity: 0.7,
              shadowRadius: 6,
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

interface Props {
  hand: HandState;
  side: "L" | "R";
  accentColor: string;
}

export function FingerBendDisplay({ hand, side, accentColor }: Props) {
  const colors = useColors();
  const fingers = FINGER_ORDER;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.side, { color: colors.mutedForeground }]}>{side}</Text>
      <View style={styles.bars}>
        {fingers.map((f) => (
          <FingerBar
            key={f}
            bend={hand.fingers[f].bend}
            label={FINGER_LABELS[f]}
            accentColor={accentColor}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  side: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  bars: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-end",
    height: 56,
  },
  fingerCol: {
    alignItems: "center",
    gap: 3,
  },
  track: {
    width: 10,
    height: 48,
    borderRadius: 5,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  fill: {
    width: "100%",
    borderRadius: 5,
  },
  label: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
  },
});
