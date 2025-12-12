import { Skeleton } from "@/src/components/ui/Skeleton";
import React from "react";
import { View, Dimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";

const { width } = Dimensions.get("window");
// const COLUMN_WIDTH = (width - 48) / 2; // Assuming px-6 (24px padding on each side)

const SkeletonItem = ({ index }: { index: number }) => {
  // Randomize heights to mimic masonry feel
  const randomHeight = index % 2 === 0 ? 250 : 320;

  return (
    <View className="mb-4 pr-3" style={{ width: "100%" }}>
      {/* Image Placeholder */}
      <Skeleton
        width="100%"
        height={randomHeight}
        borderRadius={16}
        className="mb-3"
      />

      {/* Title Line */}
      <Skeleton width="80%" height={16} borderRadius={4} className="mb-2" />

      {/* Price/Location Line */}
      <View className="flex-row justify-between mt-1">
        <Skeleton width="40%" height={14} borderRadius={4} />
        <Skeleton width="20%" height={14} borderRadius={4} />
      </View>
    </View>
  );
};

export const FeedSkeleton = () => {
  // Render a static list of 6 items to fill the screen
  const dummyData = Array.from({ length: 6 }).map((_, i) => i);

  return (
    <View className="flex-1 px-6 pt-2">
      <FlashList
        data={dummyData}
        numColumns={2}
        renderItem={({ index }: { index: number }) => (
          <SkeletonItem index={index} />
        )}
        // @ts-ignore
        estimatedItemSize={280}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
};
