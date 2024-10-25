import { Text, View } from "react-native";
import { TabBarIconProps } from "./type";

const TabBarIcon = ({ icon, name, color, focused }: TabBarIconProps) => {
  return (
    <View className="flex items-center justify-center gap-2">
      {icon}
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"}`}
        style={{ color }}
      >
        {name}
      </Text>
    </View>
  );
};

export default TabBarIcon;
