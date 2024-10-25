import { View, Image } from "react-native";
import React from "react";
import { router, Tabs } from "expo-router";
import { THEME } from "@/constants/theme";
import InfoBox from "@/components/generic/InfoBox";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileTabBarItem } from "@/components/navigation";
import { FontAwesome5 } from "@expo/vector-icons";
import { Button } from "@/components/ui";
import { useProfileStats } from "@/hooks/useUser";
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus";
import { useGetCurrentUserInfo, useLogout } from "@/hooks/useAuth";
import { showToastWithStatus } from "@/utils/alert";

const ProfileLayout = () => {
  const { data: user } = useGetCurrentUserInfo();

  const { mutateAsync } = useLogout();
  const { data: stats, refetch } = useProfileStats(user?.$id as string);
  const handleLogout = async () => {
    try {
      await mutateAsync().then(() => {
        router.replace("/login");
      });
    } catch (error) {
      showToastWithStatus((error as Error).message, 500);
    }
  };
  useRefreshOnFocus(refetch);
  return (
    <SafeAreaView className="bg-background h-full">
      <View className="h-full w-full flex justify-center items-center mt-6">
        <Button
          onPress={handleLogout}
          className="flex flex-row justify-end w-full px-4"
          variant={"ghost"}
          size={"icon"}
        >
          <FontAwesome5
            name="sign-out-alt"
            size={30}
            color={THEME.colors.red["100"]}
          />
        </Button>

        <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
          <Image
            source={{ uri: user?.avatar }}
            className="w-[90%] h-[90%] rounded-lg"
            resizeMode="cover"
          />
        </View>

        <InfoBox
          title={user?.username ?? ""}
          containerStyles="mt-3"
          titleStyles="text-lg"
        />
        <View className="mt-1 flex flex-row">
          <InfoBox
            title={stats ? stats.postsCount.toString() : "0"}
            subtitle={stats?.postsCount !== 1 ? "Posts" : "Post"}
            titleStyles="text-xl"
            containerStyles="mr-10"
          />
          <InfoBox
            title={stats ? stats.followers.toString() : "0"}
            subtitle={stats?.followers !== 1 ? "Followers" : "Follower"}
            titleStyles="text-xl"
          />
        </View>

        <View className="flex flex-row flex-1 mt-4">
          <Tabs
            initialRouteName="followers"
            screenOptions={{
              tabBarActiveTintColor: THEME.tabBarActiveTintColor,
              tabBarInactiveTintColor: THEME.tabBarInactiveTintColor,
              tabBarShowLabel: false,
              tabBarStyle: {
                backgroundColor: THEME.tabBarBackgroundColor,
                borderTopColor: "transparent",
                shadowColor: "transparent",
                height: 20,
                position: "absolute",
                top: 0,
              },
            }}
            sceneContainerStyle={{
              top: 20,
              marginTop: 20,
              paddingBottom: 35,
            }}
          >
            <Tabs.Screen
              name={"created"}
              options={{
                headerShown: false,
                title: "Created",
                tabBarIcon: ({ color, focused }) => (
                  <ProfileTabBarItem
                    color={color}
                    focused={focused}
                    name="Created Posts"
                  />
                ),
              }}
            />
            <Tabs.Screen
              name={"following"}
              options={{
                headerShown: false,
                title: "Following",
                tabBarIcon: ({ color, focused }) => (
                  <ProfileTabBarItem
                    color={color}
                    focused={focused}
                    name="Following"
                  />
                ),
              }}
            />
          </Tabs>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileLayout;
