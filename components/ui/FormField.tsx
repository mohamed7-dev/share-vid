import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { ComponentProps, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";

const FormField = ({
  containerStyle,
  title,
  ...props
}: {
  containerStyle?: string;
  title: string;
} & ComponentProps<typeof TextInput>) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${containerStyle}`}>
      <Text className="text-base text-gray-100 font-pmedium">{title}</Text>

      <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
        <TextInput
          className="flex-1 text-white font-psemibold text-base"
          value={props.value}
          placeholder={props.placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={props.onChangeText}
          secureTextEntry={title === "Password" && !showPassword}
          {...props}
        />

        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {!showPassword ? (
              <FontAwesome5
                name="eye"
                size={20}
                color={THEME.colors.gray["200"]}
              />
            ) : (
              <FontAwesome5
                name="eye-slash"
                size={20}
                color={THEME.colors.gray["200"]}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
