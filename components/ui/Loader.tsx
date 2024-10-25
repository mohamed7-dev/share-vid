import { ActivityIndicator } from "react-native";
import React from "react";
import { THEME } from "@/constants/theme";

const Loader = ({ size, color }: { size?: number; color?: string }) => {
  return (
    <ActivityIndicator
      animating={true}
      color={color || THEME.colors.secondary["200"]}
      size={size || 30}
    />
  );
};

export default Loader;
