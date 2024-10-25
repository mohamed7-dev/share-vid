import React from "react";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { THEME } from "@/constants/theme";
import { REDIRECT_ROUTE } from "@/constants/routes";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const AuthLayout = () => {
  const { data, isSuccess, isLoading, isError } = useGetCurrentUserInfo();

  // check if the user loggedin and redirect to /home
  if (data && isSuccess && !isLoading && !isError) {
    return <Redirect href={REDIRECT_ROUTE} />;
  }
  return (
    <>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" backgroundColor={THEME.colors.background} />
    </>
  );
};

export default AuthLayout;
