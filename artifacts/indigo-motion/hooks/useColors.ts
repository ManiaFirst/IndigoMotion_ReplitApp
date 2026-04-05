import colors from "@/constants/colors";

/**
 * Returns the dark design tokens for Indigo Motion.
 * The app always uses dark mode (userInterfaceStyle: "dark" in app.json).
 */
export function useColors() {
  // Indigo Motion is always dark — force dark palette
  const palette = (colors as Record<string, typeof colors.light>).dark ?? colors.light;
  return { ...palette, radius: colors.radius };
}
