import { View } from "react-native";
import React from "react";
import { Bar } from "react-native-progress";
import { THEME } from "@/constants/theme";
import { mergeClasses } from "@/utils/twMerge";

const ProgressBar = ({
  isLoading,
  containerStyle,
}: {
  isLoading: boolean;
  containerStyle?: string;
}) => {
  return (
    <View
      className={mergeClasses("absolute top-0 left-0 w-full", containerStyle)}
    >
      {isLoading && (
        <Bar
          progress={0.7}
          width={null}
          height={10}
          color={THEME.colors.secondary["200"]}
          borderWidth={0}
          animated
          indeterminate
        />
      )}
    </View>
  );
};

export default ProgressBar;
