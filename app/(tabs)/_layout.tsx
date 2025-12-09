import { TabBar } from "@/src/components/navigation/TabBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Feed",
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: "Map",
                }}
            />
            <Tabs.Screen
                name="sell"
                options={{
                    title: "Sell",
                }}
            />
            <Tabs.Screen
                name="inbox"
                options={{
                    title: "Inbox",
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                }}
            />
        </Tabs>
    );
}
