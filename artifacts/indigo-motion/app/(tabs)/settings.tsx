import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  accent?: string;
}

function ToggleRow({ label, description, value, onToggle, accent = "#7C3AED" }: ToggleRowProps) {
  const colors = useColors();
  return (
    <View style={[rowStyles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={rowStyles.text}>
        <Text style={[rowStyles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[rowStyles.desc, { color: colors.mutedForeground }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: accent }}
        thumbColor={value ? "#fff" : colors.mutedForeground}
      />
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  text: { flex: 1 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});

function LinkRow({ label, value, icon, accent = "#7C3AED" }: { label: string; value?: string; icon: string; accent?: string }) {
  const colors = useColors();
  return (
    <Pressable style={({ pressed }) => [linkStyles.row, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
      <View style={[linkStyles.iconWrap, { backgroundColor: `${accent}18` }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={accent} />
      </View>
      <Text style={[linkStyles.label, { color: colors.foreground }]}>{label}</Text>
      {value && <Text style={[linkStyles.value, { color: colors.mutedForeground }]}>{value}</Text>}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const linkStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  value: { fontSize: 13, fontFamily: "Inter_400Regular" },
});

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [haptics, setHaptics] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [latencyMode, setLatencyMode] = useState(false);
  const [sessionLog, setSessionLog] = useState(true);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

        {/* Profile */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: "#7C3AED" }]}>
          <View style={[styles.avatar, { backgroundColor: "#7C3AED25" }]}>
            <MaterialCommunityIcons name="account" size={32} color="#7C3AED" />
          </View>
          <View style={styles.profileText}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>Indigo Performer</Text>
            <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>performer@indigomotion.io</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.editBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
            <Feather name="edit-2" size={14} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Glove Section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Glove Connection</Text>
        <View style={styles.group}>
          <ToggleRow
            label="Auto-Connect"
            description="Reconnect to last paired gloves on launch"
            value={autoConnect}
            onToggle={() => setAutoConnect((v) => !v)}
            accent="#06b6d4"
          />
          <ToggleRow
            label="Ultra-Low Latency Mode"
            description="Prioritize speed over battery life"
            value={latencyMode}
            onToggle={() => setLatencyMode((v) => !v)}
            accent="#d946ef"
          />
        </View>
        <View style={styles.group}>
          <LinkRow label="Paired Gloves" value="IM-LEFT-01, IM-RIGHT-01" icon="bluetooth-settings" accent="#06b6d4" />
          <LinkRow label="Firmware Version" value="v2.4.1" icon="chip" accent="#7C3AED" />
          <LinkRow label="Scan for New Devices" icon="bluetooth-audio" accent="#a78bfa" />
        </View>

        {/* Audio Section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Audio</Text>
        <View style={styles.group}>
          <LinkRow label="Audio Output" value="System Default" icon="speaker" accent="#22c55e" />
          <LinkRow label="MIDI Destination" value="Ableton Live" icon="midi" accent="#f59e0b" />
          <LinkRow label="Latency Offset" value="12 ms" icon="timer-outline" accent="#d946ef" />
        </View>

        {/* App Section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>App</Text>
        <View style={styles.group}>
          <ToggleRow
            label="Haptic Feedback"
            description="Vibrate on key interactions"
            value={haptics}
            onToggle={() => setHaptics((v) => !v)}
            accent="#7C3AED"
          />
          <ToggleRow
            label="Dark Theme"
            description="Use dark interface at all times"
            value={darkMode}
            onToggle={() => setDarkMode((v) => !v)}
            accent="#7C3AED"
          />
          <ToggleRow
            label="Session Logging"
            description="Save motion data from each performance"
            value={sessionLog}
            onToggle={() => setSessionLog((v) => !v)}
            accent="#a78bfa"
          />
        </View>

        <View style={styles.group}>
          <LinkRow label="Session History" icon="history" accent="#a78bfa" />
          <LinkRow label="About Indigo Motion" icon="information-outline" accent="#7C3AED" />
          <LinkRow label="Support" icon="headset" accent="#06b6d4" />
        </View>

        <Pressable style={({ pressed }) => [styles.signOut, { borderColor: "#ef4444", opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.signOutText, { color: "#ef4444" }]}>Sign Out</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>Indigo Motion v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 10 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: { flex: 1 },
  profileName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  profileEmail: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 6, marginBottom: 2 },
  group: { gap: 8 },
  signOut: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    alignItems: "center",
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  version: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 4 },
});
