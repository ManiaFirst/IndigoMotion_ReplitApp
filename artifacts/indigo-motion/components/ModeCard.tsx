import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { PerformMode } from "@/context/GloveContext";

export interface ModeInfo {
  id: PerformMode;
  name: string;
  description: string;
  icon: string;
  iconFamily: "MaterialCommunityIcons" | "Feather";
  accent: string;
  tag: string;
}

export const MODES: ModeInfo[] = [
  {
    id: "melodic_flow",
    name: "Melodic Flow",
    description: "Hand position shapes scale and melody. Fluid, expressive lead lines.",
    icon: "music-note-eighth",
    iconFamily: "MaterialCommunityIcons",
    accent: "#a78bfa",
    tag: "LEAD",
  },
  {
    id: "bass_sculptor",
    name: "Bass Sculptor",
    description: "Grip intensity drives bass frequency and resonance depth.",
    icon: "waves",
    iconFamily: "MaterialCommunityIcons",
    accent: "#06b6d4",
    tag: "BASS",
  },
  {
    id: "filter_sweep",
    name: "Filter Sweep",
    description: "Tilt and rotate to sweep filters across the full frequency spectrum.",
    icon: "sine-wave",
    iconFamily: "MaterialCommunityIcons",
    accent: "#d946ef",
    tag: "FX",
  },
  {
    id: "arp_weaver",
    name: "Arp Weaver",
    description: "Individual fingers trigger and weave arpeggio patterns in real-time.",
    icon: "piano",
    iconFamily: "MaterialCommunityIcons",
    accent: "#22c55e",
    tag: "ARP",
  },
  {
    id: "drone_forge",
    name: "Drone Forge",
    description: "Both hands together sculpt evolving pad textures and drone layers.",
    icon: "signal-variant",
    iconFamily: "MaterialCommunityIcons",
    accent: "#f59e0b",
    tag: "PAD",
  },
];

interface Props {
  mode: ModeInfo;
  isActive: boolean;
  onPress: () => void;
}

export function ModeCard({ mode, isActive, onPress }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isActive ? `${mode.accent}18` : colors.card,
          borderColor: isActive ? mode.accent : colors.border,
          opacity: pressed ? 0.85 : 1,
          shadowColor: isActive ? mode.accent : "transparent",
          shadowOpacity: isActive ? 0.25 : 0,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${mode.accent}22` }]}>
        <MaterialCommunityIcons name={mode.icon as any} size={26} color={mode.accent} />
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]}>{mode.name}</Text>
          <View style={[styles.tag, { backgroundColor: `${mode.accent}22` }]}>
            <Text style={[styles.tagText, { color: mode.accent }]}>{mode.tag}</Text>
          </View>
        </View>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>{mode.description}</Text>
      </View>

      {isActive && (
        <View style={[styles.activeIndicator, { backgroundColor: mode.accent }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  desc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  activeIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
});
