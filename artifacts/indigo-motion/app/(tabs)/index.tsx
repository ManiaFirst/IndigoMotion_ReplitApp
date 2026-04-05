import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GloveStatusBar } from "@/components/GloveStatusBar";
import { MODES, ModeCard } from "@/components/ModeCard";
import { useGlove } from "@/context/GloveContext";
import { useColors } from "@/hooks/useColors";

export default function PerformScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeMode, setActiveMode, isSessionActive } = useGlove();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const handleModeSelect = (modeId: typeof MODES[0]["id"]) => {
    setActiveMode(modeId);
  };

  const selectedMode = MODES.find((m) => m.id === activeMode);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.brand, { color: colors.primary }]}>INDIGO MOTION</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Motion-to-Music Controller
            </Text>
          </View>
          <GloveStatusBar />
        </View>

        {/* Mode picker */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Performance Mode</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          Select how your gloves shape the sound
        </Text>

        <View style={styles.modes}>
          {MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              isActive={activeMode === mode.id}
              onPress={() => handleModeSelect(mode.id)}
            />
          ))}
        </View>

        {/* Launch button */}
        {activeMode && (
          <Pressable
            style={({ pressed }) => [
              styles.launchBtn,
              {
                backgroundColor: selectedMode?.accent ?? colors.primary,
                opacity: pressed ? 0.8 : 1,
                shadowColor: selectedMode?.accent ?? colors.primary,
                shadowOpacity: 0.5,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
              },
            ]}
            onPress={() => router.push("/(tabs)/session")}
          >
            <Text style={styles.launchText}>
              {isSessionActive ? "Resume Session" : "Launch Session"}
            </Text>
          </Pressable>
        )}

        {!activeMode && (
          <View style={[styles.hint, { borderColor: colors.border }]}>
            <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
              Select a mode above to begin
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  brand: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  modes: {
    gap: 0,
  },
  launchBtn: {
    marginTop: 20,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  launchText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  hint: {
    marginTop: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 18,
    alignItems: "center",
  },
  hintText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
