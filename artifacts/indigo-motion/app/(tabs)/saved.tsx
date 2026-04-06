import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useGlove, type SavedSession } from "@/context/GloveContext";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

interface SessionRowProps {
  session: SavedSession;
  onDelete: (id: string) => void;
}

function SessionRow({ session, onDelete }: SessionRowProps) {
  const colors = useColors();

  const handleDelete = () => {
    if (Platform.OS === "web") {
      onDelete(session.id);
    } else {
      Alert.alert("Delete Session", "Remove this recording?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(session.id) },
      ]);
    }
  };

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.colorBar, { backgroundColor: session.modeAccent }]} />
      <View style={[styles.iconWrap, { backgroundColor: `${session.modeAccent}20` }]}>
        <MaterialCommunityIcons name="waveform" size={20} color={session.modeAccent} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.modeName, { color: colors.foreground }]}>{session.modeName}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {formatDate(session.date)} · {formatTime(session.date)}
          </Text>
        </View>
      </View>
      <View style={styles.rowRight}>
        <View style={[styles.durationBadge, { backgroundColor: `${session.modeAccent}18` }]}>
          <Text style={[styles.duration, { color: session.modeAccent }]}>
            {formatDuration(session.duration)}
          </Text>
        </View>
        <Pressable onPress={handleDelete} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

export default function SavedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { savedSessions, deleteSession } = useGlove();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const totalTime = savedSessions.reduce((a, s) => a + s.duration, 0);
  const totalH = Math.floor(totalTime / 3600);
  const totalM = Math.floor((totalTime % 3600) / 60);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Sessions</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your recorded performances
        </Text>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: "#a78bfa" }]}>{savedSessions.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Recordings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: "#06b6d4" }]}>
              {totalH > 0 ? `${totalH}h ${totalM}m` : `${totalM}m`}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Time</Text>
          </View>
        </View>

        {savedSessions.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <MaterialCommunityIcons name="waveform" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No recordings yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Start a session and hit Record to save your performance
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {savedSessions.map((session) => (
              <SessionRow key={session.id} session={session} onDelete={deleteSession} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 26, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    gap: 12,
    paddingRight: 14,
    paddingVertical: 14,
  },
  colorBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
    marginLeft: -1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: { flex: 1 },
  modeName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  meta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  rowRight: { alignItems: "flex-end", gap: 8 },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  duration: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  empty: {
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 40,
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
