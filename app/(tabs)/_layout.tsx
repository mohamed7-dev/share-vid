import React from "react";
import { Tabs } from "expo-router";
import TabBarIcon from "@/components/navigation/TabBarIcon";
import { tabRoutes } from "@/constants/routes";
import { THEME } from "@/constants/theme";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5 } from "@expo/vector-icons";
const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: THEME.tabBarActiveTintColor,
          tabBarInactiveTintColor: THEME.tabBarInactiveTintColor,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: THEME.tabBarBackgroundColor,
            borderTopWidth: 1,
            borderTopColor: THEME.tabBarBorderColor,
            height: 84,
          },
        }}
      >
        {tabRoutes.map((r) => {
          return (
            <Tabs.Screen
              key={r.title}
              name={r.name}
              options={{
                headerShown: false,
                title: r.title,
                tabBarIcon: ({ color, focused }) => (
                  <TabBarIcon
                    name={r.title}
                    color={color}
                    focused={focused}
                    icon={
                      <FontAwesome5 name={r.icon} size={24} color={color} />
                    }
                  />
                ),
              }}
            />
          );
        })}
      </Tabs>
      <StatusBar backgroundColor={THEME.colors.background} style="light" />
    </>
  );
};

export default TabsLayout;
