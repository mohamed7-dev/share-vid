import { TouchableOpacity, Text } from "react-native";
import React, { ComponentProps } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { mergeClasses } from "@/utils/twMerge";
import Loader from "./Loader";

const buttonVariants = cva(
  "rounded-xl flex flex-row justify-center items-center",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        outline: "bg-transparent border border-secondary text-secondary",
        ghost: "bg-transparent text-secondary",
      },
      size: {
        default: "h-12 px-4 py-2",
        lg: "h-12 rounded-md px-8",
        icon: "h-10 w-10 rounded-full",
        sm: "h-8 rounded-md px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = {
  extraTextStyle?: string;
  isLoading?: boolean;
  children: React.ReactNode;
} & ComponentProps<typeof TouchableOpacity> &
  VariantProps<typeof buttonVariants>;
const Button = ({
  isLoading,
  extraTextStyle,
  variant,
  size,
  onPress,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.6}
      className={mergeClasses(
        buttonVariants({ variant, size, className }),
        isLoading ? "opacity-50" : ""
      )}
      {...props}
    >
      {children}
      {isLoading && <Loader />}
    </TouchableOpacity>
  );
};

export function ButtonText({
  extraTextStyle,
  children,
}: {
  extraTextStyle?: string;
  children: string;
}) {
  return (
    <Text
      className={mergeClasses(
        `text-primary font-psemibold text-lg`,
        extraTextStyle
      )}
    >
      {children}
    </Text>
  );
}
export default Button;
