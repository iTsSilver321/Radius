import { Button } from "@/src/components/ui/Button";
import { GlassView } from "@/components/ui/GlassView";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, MapPin, ShieldCheck, Zap } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Radius",
    subtitle: "The Neon Marketplace",
    description:
      "Experience a new era of buying and selling. Local, verified, and beautifully designed.",
    icon: <Zap size={64} color="#3b82f6" />,
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Discover Nearby",
    subtitle: "Find Hidden Gems",
    description:
      "Explore items around you interactively. See what's trending in your neighborhood.",
    icon: <MapPin size={64} color="#ec4899" />,
    color: "#ec4899",
  },
  {
    id: "3",
    title: "Stay Safe",
    subtitle: "Verified & Secure",
    description:
      "Trade with confidence. Verified profiles and secure payments keep you protected.",
    icon: <ShieldCheck size={64} color="#10b981" />,
    color: "#10b981",
  },
];

const Slide = ({ item }: { item: (typeof SLIDES)[0] }) => {
  return (
    <View
      style={{
        width,
        height: height * 0.7,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {/* Icon Ring */}
      <View
        className="items-center justify-center mb-8"
        style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: `${item.color}20`,
          borderWidth: 1,
          borderColor: `${item.color}50`,
          shadowColor: item.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: `${item.color}30`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {item.icon}
        </View>
      </View>

      <Text className="text-4xl font-extrabold text-center text-white mb-2 tracking-tighter shadow-sm">
        {item.title}
      </Text>
      <Text className="text-xl font-medium text-center text-gray-300 mb-6 uppercase tracking-widest">
        {item.subtitle}
      </Text>

      <GlassView
        intensity={30}
        className="p-6 rounded-2xl border border-white/10 w-full max-w-sm"
      >
        <Text className="text-lg text-center text-gray-200 leading-relaxed font-secondary">
          {item.description}
        </Text>
      </GlassView>
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      router.replace("/(tabs)");
    } catch (e) {
      console.error(e);
      router.replace("/(tabs)");
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#1e1b4b", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Ambient Glows */}
      <View className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <View className="absolute top-[-100] left-[-100] w-[300] h-[300] rounded-full bg-blue-500/20 blur-[100px]" />
        <View className="absolute bottom-[-100] right-[-100] w-[300] h-[300] rounded-full bg-purple-500/20 blur-[100px]" />
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={
          useRef(({ viewableItems }: any) => {
            if (viewableItems[0]) {
              setCurrentIndex(viewableItems[0].index);
            }
          }).current
        }
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => <Slide item={item} />}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 80,
        }}
      />

      {/* Footer (Dots + Button) */}
      <View className="absolute bottom-12 left-0 right-0 px-8 items-center gap-8">
        {/* Pagination Dots */}
        <View className="flex-row gap-3">
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 30, 10],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={{
                  width: dotWidth,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: SLIDES[i].color,
                  opacity,
                }}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <Button
          title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          variant="primary"
          size="lg"
          className="w-full shadow-lg shadow-blue-500/30"
          icon={
            currentIndex === SLIDES.length - 1 ? (
              <ArrowRight size={20} color="white" />
            ) : undefined
          }
          style={{
            backgroundColor:
              currentIndex === SLIDES.length - 1
                ? "#3b82f6"
                : "rgba(255,255,255,0.1)",
            borderWidth: currentIndex === SLIDES.length - 1 ? 0 : 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        />
      </View>
    </View>
  );
}
