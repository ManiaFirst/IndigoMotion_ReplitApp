import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useGlove } from "@/context/GloveContext";

type CalibStep = "neutral" | "fist" | "spread" | "tilt" | "done";

const STEPS: { id: CalibStep; label: string; instruction: string; icon: string }[] = [
  { id: "neutral", label: "Neutral Position", instruction: "Hold both hands flat, palm down, fingers slightly apart. Keep still for 3 seconds.", icon: "hand-right" },
  { id: "fist", label: "Full Fist", instruction: "Close both hands into a tight fist. Hold for 3 seconds.", icon: "fist" },
  { id: "spread", label: "Full Spread", instruction: "Spread all fingers as wide as possible on both hands. Hold for 3 seconds.", icon: "hand-back-right" },
  { id: "tilt", label: "Orientation Axes", instruction: "Slowly rotate each wrist in a full circle, then tilt up and down. This maps your range of motion.", icon: "rotate-3d-variant" },
  { id: "done", label: "Calibration Complete", instruction: "Your gloves are calibrated and ready to perform.", icon: "check-circle-outline" },
];

function StepIndicator({ steps, current }: { steps: typeof STEPS; current: number }) {
  const colors = useColors();
  return (
    <View style={stepStyles.row}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={s.id}>
            <View
              style={[
                stepStyles.circle,
                {
                  backgroundColor: done ? "#7C3AED" : active ? "#7C3AED20" : colors.card,
                  borderColor: done || active ? "#7C3AED" : colors.border,
                },
              ]}
            >
              {done ? (
                <MaterialCommunityIcons name="check" size={12} color="#fff" />
              ) : (
                <Text style={[stepStyles.num, { color: active ? "#7C3AED" : colors.mutedForeground }]}>{i + 1}</Text>
              )}
            </View>
            {i < steps.length - 1 && (
              <View style={[stepStyles.line, { backgroundColor: done ? "#7C3AED" : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  num: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  line: { flex: 1, height: 1.5, marginHorizontal: 4 },
});

export default function CalibrateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { leftHand, rightHand } = useGlove();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const step = STEPS[currentStep];
  const isDone = step?.id === "done";

  const handleCapture = () => {
    if (isCapturing || isDone) return;
    setIsCapturing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsCapturing(false);
          setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
          return 0;
        }
        return p + 3.5;
      });
    }, 100);
  };

  const reset = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsCapturing(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Calibration</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Sync your gloves to your range of motion for accurate tracking
        </Text>

        <View style={styles.gloveStatus}>
          <View style={[styles.gloveCard, { backgroundColor: colors.card, borderColor: leftHand.connected ? "#a78bfa" : colors.border }]}>
            <MaterialCommunityIcons name="hand-left" size={22} color={leftHand.connected ? "#a78bfa" : colors.mutedForeground} />
            <Text style={[styles.gloveLabel, { color: colors.foreground }]}>Left Glove</Text>
            <Text style={[styles.gloveStatus2, { color: leftHand.connected ? "#22c55e" : "#ef4444" }]}>
              {leftHand.connected ? `Connected · ${leftHand.battery}%` : "Disconnected"}
            </Text>
          </View>
          <View style={[styles.gloveCard, { backgroundColor: colors.card, borderColor: rightHand.connected ? "#06b6d4" : colors.border }]}>
            <MaterialCommunityIcons name="hand-right" size={22} color={rightHand.connected ? "#06b6d4" : colors.mutedForeground} />
            <Text style={[styles.gloveLabel, { color: colors.foreground }]}>Right Glove</Text>
            <Text style={[styles.gloveStatus2, { color: rightHand.connected ? "#22c55e" : "#ef4444" }]}>
              {rightHand.connected ? `Connected · ${rightHand.battery}%` : "Disconnected"}
            </Text>
          </View>
        </View>

        <StepIndicator steps={STEPS} current={currentStep} />

        {/* Active step card */}
        <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: isDone ? "#22c55e" : "#7C3AED" }]}>
          <View style={[styles.stepIconWrap, { backgroundColor: isDone ? "#22c55e20" : "#7C3AED20" }]}>
            <MaterialCommunityIcons
              name={step?.icon as any}
              size={36}
              color={isDone ? "#22c55e" : "#7C3AED"}
            />
          </View>
          <Text style={[styles.stepLabel, { color: colors.foreground }]}>{step?.label}</Text>
          <Text style={[styles.stepInstruction, { color: colors.mutedForeground }]}>{step?.instruction}</Text>

          {!isDone && (
            <>
              {isCapturing && (
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: "#7C3AED" }]} />
                </View>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.captureBtn,
                  {
                    backgroundColor: isCapturing ? colors.muted : "#7C3AED",
                    opacity: pressed ? 0.8 : 1,
                    shadowColor: "#7C3AED",
                    shadowOpacity: isCapturing ? 0 : 0.4,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 6 },
                  },
                ]}
                onPress={handleCapture}
              >
                <Text style={[styles.captureBtnText, { color: isCapturing ? colors.mutedForeground : "#fff" }]}>
                  {isCapturing ? "Capturing..." : "Capture Position"}
                </Text>
              </Pressable>
            </>
          )}

          {isDone && (
            <Pressable
              style={({ pressed }) => [
                styles.captureBtn,
                { backgroundColor: "#22c55e", opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={reset}
            >
              <Text style={[styles.captureBtnText, { color: "#fff" }]}>Recalibrate</Text>
            </Pressable>
          )}
        </View>

        {/* Settings section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sensor Settings</Text>
        {[
          { label: "IMU Sensitivity", value: "High", accent: "#a78bfa" },
          { label: "Finger Bend Threshold", value: "12°", accent: "#06b6d4" },
          { label: "Dead Zone", value: "5%", accent: "#d946ef" },
          { label: "Sample Rate", value: "200 Hz", accent: "#22c55e" },
        ].map((item) => (
          <View key={item.label} style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Text style={[styles.settingValue, { color: item.accent }]}>{item.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  gloveStatus: { flexDirection: "row", gap: 10 },
  gloveCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  gloveLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  gloveStatus2: { fontSize: 11, fontFamily: "Inter_400Regular" },
  stepCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  stepIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  stepInstruction: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  captureBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  captureBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginTop: 6,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  settingLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  settingValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
