import { View, Text, ScrollView, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "@/components/ui/FormField";
import Button, { ButtonText } from "@/components/ui/Button";
import { Link, router } from "expo-router";
import IMAGES from "@/constants/images";
import { APP_NAME } from "@/constants/app";
import { REDIRECT_ROUTE } from "@/constants/routes";
import { useCredentialsRegister } from "@/hooks/useAuth";
import { showToastWithStatus } from "@/utils/alert";

const Signup = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { mutateAsync, reset, isPending } = useCredentialsRegister();

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.username) {
      showToastWithStatus(
        "Please, make sure all required fields are filled!",
        400
      );
      return;
    }
    try {
      await mutateAsync(
        {
          username: form.username,
          email: form.email,
          password: form.password,
        },
        {
          onSuccess: () => {
            router.replace(REDIRECT_ROUTE);
          },
        }
      );
    } catch (error) {
      showToastWithStatus((error as Error).message, 500);
    } finally {
      reset();
    }
  };
  return (
    <SafeAreaView className="bg-background h-full">
      <ScrollView>
        <View className="w-full flex justify-center h-full px-4 my-6">
          <Image
            source={IMAGES.logo}
            resizeMode="contain"
            className="w-[115px] h-[34px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Sign Up to {APP_NAME}
          </Text>

          <FormField
            title="Username"
            value={form.username}
            onChangeText={(e) => setForm({ ...form, username: e })}
            containerStyle="mt-10"
          />

          <FormField
            title="Email"
            value={form.email}
            onChangeText={(e) => setForm({ ...form, email: e })}
            containerStyle="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            onChangeText={(e) => setForm({ ...form, password: e })}
            containerStyle="mt-7"
          />

          <Button onPress={handleSubmit} className="mt-7" isLoading={isPending}>
            <ButtonText>Sign up</ButtonText>
          </Button>

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Have an account already?
            </Text>
            <Link
              href="/login"
              className="text-lg font-psemibold text-secondary"
            >
              Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
