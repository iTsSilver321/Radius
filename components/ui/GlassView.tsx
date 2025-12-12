import { BlurView } from "expo-blur";
import { Platform, View, ViewProps } from "react-native";

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?:
    | "light"
    | "dark"
    | "default"
    | "systemMaterial"
    | "systemMaterialLight"
    | "systemMaterialDark";
}

export function GlassView({
  style,
  intensity = 20,
  tint = "dark",
  children,
  ...props
}: GlassViewProps) {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[
        {
          overflow: "hidden",
          borderColor: "rgba(255, 255, 255, 0.1)", // glass-white
          borderWidth: 1,
          backgroundColor:
            Platform.OS === "ios"
              ? "rgba(2, 6, 23, 0.6)"
              : "rgba(2, 6, 23, 0.4)", // Slight tint
        },
        style,
      ]}
      {...props}
    >
      {children}
    </BlurView>
  );
}
