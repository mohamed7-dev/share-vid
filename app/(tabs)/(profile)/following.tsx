import { View, FlatList, Image, ViewToken } from "react-native";
import React from "react";
import { FollowingListWithRecentPosts } from "@/types/user";
import { UserCard } from "@/tab/(profile)/following";
import { ProcessStatus } from "@/components/generic";
import { router } from "expo-router";
import IMAGES from "@/constants/images";
import { useFetchUserFollowings } from "@/hooks/useUser";
import { Loader } from "@/components/ui";
import { VIEWABILITY_CONFIG } from "@/constants/app";
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const Following = () => {
  const { data: user } = useGetCurrentUserInfo();

  const { data, isLoading, isRefetching, fetchNextPage, refetch } =
    useFetchUserFollowings(user?.$id as string);

  const flatData = data ? data?.pages?.map((group) => group.data)?.flat() : [];
  console.log(flatData);

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<FollowingListWithRecentPosts["data"][0]>[];
  }) => {
    const viewedItem = viewableItems.find((item) => item.isViewable);
    if (viewedItem) {
      const lastItem = flatData[flatData.length - 3]?.userInfo?.$id;
      // if the active item is the third item from the bottom
      // fetch next page
      if (lastItem === viewedItem.key) {
        console.log("fetch next page");
        fetchNextPage();
      }
    }
  };

  useRefreshOnFocus(refetch);
  return (
    <View className="bg-background h-full">
      <FlatList
        data={flatData}
        keyExtractor={(item) => item?.userInfo?.$id}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item }) => (
          <UserCard isRefetching={isRefetching} cardInfo={item} />
        )}
        ListEmptyComponent={() => {
          if (isLoading) {
            return (
              <View className="w-full flex flex-row justify-center items-center">
                <Loader />
              </View>
            );
          } else {
            return (
              <ProcessStatus
                title="No users found"
                subtitle="You are not following anyone yet!"
                button={{
                  title: "Go to home page",
                  handlePressing: () => router.push("/home"),
                }}
              >
                <Image
                  source={IMAGES.empty}
                  resizeMode="contain"
                  className="w-full h-full"
                />
              </ProcessStatus>
            );
          }
        }}
      />
    </View>
  );
};

export default Following;
