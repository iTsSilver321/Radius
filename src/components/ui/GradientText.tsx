import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TextProps } from "react-native";

interface GradientTextProps extends TextProps {
    colors?: string[];
}

export const GradientText = ({ colors = ["#4c669f", "#3b5998", "#192f6a"], style, ...props }: GradientTextProps) => {
    return (
        <MaskedView
            maskElement={<Text {...props} style={[style, { backgroundColor: "transparent" }]} />}
        >
            <LinearGradient
                colors={colors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text {...props} style={[style, { opacity: 0 }]} />
            </LinearGradient>
        </MaskedView>
    );
};
