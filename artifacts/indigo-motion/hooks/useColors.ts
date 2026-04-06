import { useTheme } from "@/context/ThemeContext";
import colors from "@/constants/colors";

/**
 * Returns design tokens based on the current theme (dark by default).
 * The toggle in Settings updates ThemeContext which this hook reads.
 */
export function useColors() {
  const { isDark } = useTheme();
  const palette = isDark
    ? (colors as Record<string, typeof colors.light>).dark ?? colors.light
    : colors.light;
  return { ...palette, radius: colors.radius };
}
