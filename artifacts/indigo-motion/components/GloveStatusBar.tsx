import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useGlove } from "@/context/GloveContext";

function BatteryIcon({ level, color }: { level: number; color: string }) {
  const iconName =
    level > 75 ? "battery" : level > 40 ? "battery-medium" : level > 15 ? "battery-low" : "battery-alert";
  return <MaterialCommunityIcons name={iconName as any} size={14} color={color} />;
}

interface GloveStatusProps {
  label: string;
  connected: boolean;
  battery: number;
}

function GlovePill({ label, connected, battery }: GloveStatusProps) {
  const colors = useColors();
  const dotColor = connected ? "#22c55e" : "#ef4444";
  const textColor = connected ? colors.foreground : colors.mutedForeground;
  return (
    <View style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      {connected && (
        <>
          <BatteryIcon level={battery} color={colors.mutedForeground} />
          <Text style={[styles.battery, { color: colors.mutedForeground }]}>{battery}%</Text>
        </>
      )}
      {!connected && (
        <Text style={[styles.battery, { color: colors.mutedForeground }]}>off</Text>
      )}
    </View>
  );
}

export function GloveStatusBar() {
  const { leftHand, rightHand } = useGlove();
  return (
    <View style={styles.row}>
      <GlovePill label="L" connected={leftHand.connected} battery={leftHand.battery} />
      <GlovePill label="R" connected={rightHand.connected} battery={rightHand.battery} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  battery: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
