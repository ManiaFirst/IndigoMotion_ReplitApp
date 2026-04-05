import React from "react";
import { StyleSheet, View } from "react-native";
import { FingerBendDisplay } from "@/components/FingerBendDisplay";
import { IMUOrientationDisplay } from "@/components/IMUOrientationDisplay";
import { useGlove } from "@/context/GloveContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  leftAccent?: string;
  rightAccent?: string;
}

export function SensorHUD({ leftAccent = "#a78bfa", rightAccent = "#06b6d4" }: Props) {
  const { leftHand, rightHand } = useGlove();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface ?? colors.background, borderColor: colors.border }]}>
      <View style={styles.row}>
        <FingerBendDisplay hand={leftHand} side="L" accentColor={leftAccent} />
        <IMUOrientationDisplay hand={leftHand} side="L" accentColor={leftAccent} />
        <IMUOrientationDisplay hand={rightHand} side="R" accentColor={rightAccent} />
        <FingerBendDisplay hand={rightHand} side="R" accentColor={rightAccent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
  },
  row: {
    flexDirection: "row",
    gap: 6,
  },
});
