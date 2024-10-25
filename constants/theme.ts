import resolveConfig from "tailwindcss/resolveConfig";
import config from "@/tailwind.config";
import { ThemeConfig } from "tailwindcss/types/config";
const theme = resolveConfig(config);

export const THEME: ThemeConfig & any = {
  // tabBar
  tabBarActiveTintColor: "#FFA001",
  tabBarInactiveTintColor: "#CDCDE0",
  tabBarBackgroundColor: theme.theme?.colors?.background,
  tabBarBorderColor: "#232533",
  ...theme.theme,
};
