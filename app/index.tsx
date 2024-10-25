import { View, Text, ScrollView, Image } from "react-native";
import React from "react";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Images from "@/constants/images";
import { APP_NAME } from "@/constants/app";
import Button, { ButtonText } from "@/components/ui/Button";
import { StatusBar } from "expo-status-bar";
import { THEME } from "@/constants/theme";
import { REDIRECT_ROUTE } from "@/constants/routes";
import useRehydrateUserSession from "@/hooks/useRehydrateUserInfo";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const Landing = () => {
  // re-hydrate user info
  useRehydrateUserSession();

  const { isSuccess, data } = useGetCurrentUserInfo();
  if (data && isSuccess) {
    return <Redirect href={REDIRECT_ROUTE} />;
  }

  return (
    <SafeAreaView className="bg-background h-full">
      <ScrollView>
        <View className="w-full flex justify-center items-center h-full px-4">
          <Image
            source={Images.logo}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />

          <Image
            source={Images.cards}
            className="max-w-[380px] w-full h-[298px]"
            resizeMode="contain"
          />

          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
              Discover Endless{"\n"}
              Possibilities with{" "}
              <Text className="text-secondary-200">{APP_NAME}</Text>
            </Text>

            <Image
              source={Images.path}
              className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
              resizeMode="contain"
            />
          </View>

          <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
            Where Creativity Meets Innovation: Embark on a Journey of Limitless
            Exploration with Aora
          </Text>
          {isSuccess ? (
            <Button
              onPress={() => router.push(REDIRECT_ROUTE)}
              className="w-full mt-7"
            >
              <ButtonText>Continue</ButtonText>
            </Button>
          ) : (
            <Button
              onPress={() => router.push("/login")}
              className="w-full mt-7"
            >
              <ButtonText>Continue with Email</ButtonText>
            </Button>
          )}
        </View>
      </ScrollView>
      <StatusBar backgroundColor={THEME.colors.backgorund} style="light" />
    </SafeAreaView>
  );
};

export default Landing;
