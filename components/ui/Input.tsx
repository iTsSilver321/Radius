import { TextInput, TextInputProps, View, Text } from "react-native";
import { useState } from "react";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  containerClassName,
  className,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`space-y-2 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-400 ml-1">{label}</Text>
      )}
      <TextInput
        placeholderTextColor="#9ca3af"
        className={`
                    h-12 px-4 rounded-xl
                    bg-white/5 
                    border ${isFocused ? "border-primary" : error ? "border-destructive" : "border-white/10"}
                    text-white
                    font-medium
                    ${className}
                `}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text className="text-xs text-destructive ml-1">{error}</Text>}
    </View>
  );
}
