import { QUERY_CLIENT } from "@/constants/app";
import { THEME } from "@/constants/theme";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AlertNotificationRoot
      theme={"dark"}
      dialogConfig={{
        autoClose: false,
        closeOnOverlayTap: true,
      }}
      colors={[
        {
          label: THEME.colors.gray?.["100"],
          card: THEME.colors.background,
          success: THEME.colors.success,
          danger: THEME.colors.danger,
          warning: THEME.colors.warning,
          info: THEME.colors.info,
          overlay: THEME.colors.black?.["200"],
        },
        {
          label: THEME.colors.gray?.["100"],
          card: THEME.colors.background,
          success: THEME.colors.success,
          danger: THEME.colors.danger,
          warning: THEME.colors.warning,
          info: THEME.colors.info,
          overlay: THEME.colors.black?.["200"],
        },
      ]}
    >
      <QueryClientProvider client={QUERY_CLIENT}>
        <GestureHandlerRootView className="flex-1">
          {children}
        </GestureHandlerRootView>
      </QueryClientProvider>
    </AlertNotificationRoot>
  );
};

export default GlobalContextProvider;
