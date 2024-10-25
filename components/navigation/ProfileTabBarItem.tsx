import { View, Text } from "react-native";
import React from "react";
import { TabBarIconProps } from "./type";

const ProfileTabBarItem = ({
  focused,
  color,
  name,
}: Omit<TabBarIconProps, "icon">) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"}`}
        style={{ color }}
      >
        {name}
      </Text>
    </View>
  );
};

export default ProfileTabBarItem;
