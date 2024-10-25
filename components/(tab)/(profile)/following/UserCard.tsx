import { View, Text, Image } from "react-native";
import React from "react";
import { FollowingListWithRecentPosts } from "@/types/user";
import UserCardActionsMenu from "./UserCardActionsMenu";
import { mergeClasses } from "@/utils/twMerge";

const UserCard = ({
  cardInfo,
  showMenu = true,
  isRefetching,
}: {
  cardInfo: FollowingListWithRecentPosts["data"][0];
  showMenu?: boolean;
  isRefetching?: boolean;
}) => {
  const { userInfo, recentPosts } = cardInfo;
  if (!cardInfo) {
    return null;
  }
  return (
    <View
      className={mergeClasses(
        "flex items-center gap-2 mb-14 px-4",
        isRefetching && "opacity-50"
      )}
    >
      <View className="flex flex-row items-center justify-between">
        <View className="flex items-center flex-row flex-1 gap-2">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center p-0.5">
            <Image
              source={{ uri: userInfo.avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex flex-1 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {userInfo.username}
            </Text>
          </View>
        </View>
        {showMenu && <UserCardActionsMenu userId={userInfo.$id} />}
      </View>

      <View className="overflow-hidden w-full h-60 rounded-xl mt-3 relative flex flex-row gap-x-1 justify-center">
        <View className="w-1/2 h-full rounded-l-xl bg-gray-300">
          <Image
            source={{ uri: recentPosts?.documents[0]?.poster }}
            className="rounded-l-xl w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="w-1/2 h-full rounded-r-xl bg-gray-300">
          <Image
            source={{ uri: recentPosts?.documents[1]?.poster }}
            className="w-full h-full rounded-r-xl"
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
};

export default UserCard;
