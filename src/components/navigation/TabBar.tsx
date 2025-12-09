import { GlassView } from "@/components/ui/GlassView";
import { useNotificationStore } from "@/src/features/notifications/store";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Home, Map, MessageCircle, Plus, User } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const icons: Record<string, (props: any) => React.ReactNode> = {
    index: (props) => <Home {...props} />,
    map: (props) => <Map {...props} />,
    sell: (props) => <Plus {...props} />,
    inbox: (props) => <MessageCircle {...props} />,
    profile: (props) => <User {...props} />,
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 pointer-events-box-none"
      style={{ paddingBottom: insets.bottom }}
    >
      <GlassView
        className="mx-4 mb-4 flex-row items-center justify-between rounded-3xl p-2 overflow-hidden"
        intensity={40}
        tint="dark"
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const Icon = icons[route.name] || icons["index"];
          const isSell = route.name === "sell";

          if (isSell) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                className="mx-2 -mt-4"
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#4338ca", "#7c3aed"]} // neon-indigo to neon-violet
                  className="h-16 w-16 items-center justify-center rounded-full shadow-lg border-4 border-[#020617]"
                >
                  <Icon color="white" size={32} strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TabIcon
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              Icon={Icon}
              badgeCount={route.name === "inbox" ? unreadCount : 0}
            />
          );
        })}
      </GlassView>
    </View>
  );
}

function TabIcon({
  isFocused,
  onPress,
  Icon,
  badgeCount,
}: {
  isFocused: boolean;
  onPress: () => void;
  Icon: any;
  badgeCount?: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isFocused ? 1.2 : 1) }],
    };
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center justify-center py-3"
      activeOpacity={0.8}
    >
      <View>
        <Animated.View style={animatedStyle}>
          <Icon
            size={24}
            color={isFocused ? "#7c3aed" : "#94a3b8"} // neon-violet vs slate-400
            strokeWidth={isFocused ? 2.5 : 2}
          />
        </Animated.View>
        {badgeCount ? (
          <View className="absolute -right-2 -top-2 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 border border-[#020617]">
            <Text className="text-[10px] font-bold text-white">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Text>
          </View>
        ) : null}
      </View>
      {isFocused && (
        <Animated.View
          entering={FadeIn}
          className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary shadow-[0_0_10px_theme('colors.primary.DEFAULT')]"
        />
      )}
    </TouchableOpacity>
  );
}
