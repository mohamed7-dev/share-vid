import { View, Text, ScrollView, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Button, { ButtonText } from "@/components/ui/Button";
import { Link, router } from "expo-router";
import FormField from "@/components/ui/FormField";
import IMAGES from "@/constants/images";
import { APP_NAME } from "@/constants/app";
import { REDIRECT_ROUTE } from "@/constants/routes";
import { useCredentialsLogin } from "@/hooks/useAuth";
import { showToastWithStatus } from "@/utils/alert";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const { mutateAsync, reset, isPending } = useCredentialsLogin();

  const handleSubmitting = async () => {
    if (form.email === "" || form.password === "") {
      showToastWithStatus("Please fill in all required fields!", 400);
      return;
    }
    try {
      await mutateAsync(
        {
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
        <View className="w-full flex justify-center h-full min-h-[81vh] px-4 my-6">
          <Image
            source={IMAGES.logo}
            resizeMode="contain"
            className="w-[115px] h-[34px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Log in to {APP_NAME}
          </Text>

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

          <Button
            onPress={handleSubmitting}
            className="mt-7"
            isLoading={isPending}
          >
            <ButtonText>Login</ButtonText>
          </Button>

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/signup"
              className="text-lg font-psemibold text-secondary"
            >
              Signup
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
