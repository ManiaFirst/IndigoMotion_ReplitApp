import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { PerformMode } from "@/context/GloveContext";

export interface ModeInfo {
  id: PerformMode;
  name: string;
  description: string;
  icon: string;
  accent: string;
  tag: string;
}

export const MODES: ModeInfo[] = [
  {
    id: "melodic_flow",
    name: "Melodic Flow",
    description: "Hand position shapes scale and melody.",
    icon: "music-note-eighth",
    accent: "#a78bfa",
    tag: "LEAD",
  },
  {
    id: "bass_sculptor",
    name: "Bass Sculptor",
    description: "Grip intensity drives bass frequency.",
    icon: "waves",
    accent: "#06b6d4",
    tag: "BASS",
  },
  {
    id: "filter_sweep",
    name: "Filter Sweep",
    description: "Tilt and rotate to sweep filters.",
    icon: "sine-wave",
    accent: "#d946ef",
    tag: "FX",
  },
  {
    id: "arp_weaver",
    name: "Arp Weaver",
    description: "Fingers trigger arpeggio patterns.",
    icon: "piano",
    accent: "#22c55e",
    tag: "ARP",
  },
  {
    id: "drone_forge",
    name: "Drone Forge",
    description: "Both hands sculpt pad textures.",
    icon: "signal-variant",
    accent: "#f59e0b",
    tag: "PAD",
  },
];

interface Props {
  mode: ModeInfo;
  isActive: boolean;
  onPress: () => void;
  size: number;
}

export function ModeCard({ mode, isActive, onPress, size }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width: size,
          height: size,
          backgroundColor: isActive ? `${mode.accent}1a` : colors.card,
          borderColor: isActive ? mode.accent : colors.border,
          opacity: pressed ? 0.82 : 1,
          shadowColor: isActive ? mode.accent : "transparent",
          shadowOpacity: isActive ? 0.3 : 0,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 4 },
        },
      ]}
    >
      {isActive && (
        <View style={[styles.activeDot, { backgroundColor: mode.accent }]} />
      )}

      <View style={[styles.iconWrap, { backgroundColor: `${mode.accent}22` }]}>
        <MaterialCommunityIcons name={mode.icon as any} size={30} color={mode.accent} />
      </View>

      <View style={styles.bottom}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {mode.name}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: `${mode.accent}22` }]}>
          <Text style={[styles.tagText, { color: mode.accent }]}>{mode.tag}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  activeDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    gap: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
});
