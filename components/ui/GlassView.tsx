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
  if (Platform.OS === "android") {
    return (
      <View
        style={[
          {
            backgroundColor: "rgba(2, 6, 23, 0.8)", // Midnight with opacity
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

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
            Platform.OS === "ios" ? "rgba(2, 6, 23, 0.6)" : undefined, // slight tint for iOS
        },
        style,
      ]}
      {...props}
    >
      {children}
    </BlurView>
  );
}
