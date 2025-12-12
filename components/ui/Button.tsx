import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { cn } from "@/src/lib/utils";
import { useHaptics } from "@/src/hooks/useHaptics";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "glass" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  textClassName,
  children,
  onPressIn,
  ...props
}: ButtonProps) {
  const { light } = useHaptics();
  const baseStyles =
    "flex-row items-center justify-center rounded-xl active:opacity-80";

  const handlePressIn = (e: any) => {
    light();
    onPressIn?.(e);
  };

  // Size variants
  const sizeStyles = {
    sm: "h-9 px-4",
    md: "h-12 px-6",
    lg: "h-14 px-8",
    icon: "h-10 w-10",
  };

  // Text styles
  const textBaseStyles = "font-bold text-center";
  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    icon: "text-xl",
  };

  if (variant === "primary") {
    return (
      <TouchableOpacity
        {...props}
        onPressIn={handlePressIn}
        className={cn(baseStyles, sizeStyles[size], className)}
      >
        <LinearGradient
          colors={["#4338ca", "#7c3aed"]} // Indigo to Violet
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={cn(
            "absolute inset-0 rounded-xl",
            baseStyles,
            sizeStyles[size],
          )}
        />
        <Text
          className={cn(
            textBaseStyles,
            textSizeStyles[size],
            "text-white",
            textClassName,
          )}
        >
          {children}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === "glass") {
    return (
      <TouchableOpacity
        {...props}
        onPressIn={handlePressIn}
        className={cn(
          baseStyles,
          sizeStyles[size],
          "border border-white/10 bg-white/5",
          className,
        )}
      >
        <Text
          className={cn(
            textBaseStyles,
            textSizeStyles[size],
            "text-white",
            textClassName,
          )}
        >
          {children}
        </Text>
      </TouchableOpacity>
    );
  }

  // Other variants
  const variantStyles = {
    secondary: "bg-secondary border border-border",
    outline: "border border-primary bg-transparent",
    ghost: "bg-transparent",
    primary: "", // Handled above
    glass: "", // Handled above
  };

  const variantTextStyles = {
    secondary: "text-secondary-foreground",
    outline: "text-primary",
    ghost: "text-primary",
    primary: "",
    glass: "",
  };

  return (
    <TouchableOpacity
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      onPressIn={handlePressIn}
      {...props}
    >
      <Text
        className={cn(
          textBaseStyles,
          textSizeStyles[size],
          variantTextStyles[variant],
          textClassName,
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
