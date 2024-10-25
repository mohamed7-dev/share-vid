import { View, Text } from "react-native";
import React from "react";
import Button, { ButtonText } from "../ui/Button";

const ProcessStatus = ({
  title,
  subtitle,
  children,
  button: { title: buttonTitle, handlePressing },
}: {
  title: string;
  subtitle: string;
  children: React.ReactElement;
  button: {
    title: string;
    handlePressing: () => void;
  };
}) => {
  return (
    <View className="flex justify-center items-center px-4">
      <View className="w-[270px] h-[216px]">{children}</View>

      <Text className="text-sm font-pmedium text-gray-100 capitalize">
        {title}
      </Text>
      <Text className="text-xl text-center font-psemibold text-white mt-2">
        {subtitle}
      </Text>

      <Button onPress={handlePressing} className="w-full my-5">
        <ButtonText>{buttonTitle}</ButtonText>
      </Button>
    </View>
  );
};

export default ProcessStatus;
