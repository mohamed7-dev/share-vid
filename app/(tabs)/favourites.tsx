import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  ViewToken,
} from "react-native";
import React, { useState } from "react";
import { VideoDocWithStates } from "@/types/video";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoCard } from "@/components/videos";
import { ProcessStatus } from "@/components/generic";
import { router } from "expo-router";
import IMAGES from "@/constants/images";
import { Loader, SearchInput } from "@/components/ui";
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus";
import { useFetchUserFavourites } from "@/hooks/useVideo";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const Favourites = () => {
  const { data: user } = useGetCurrentUserInfo();
  const { data, isPending, isFetching, refetch, fetchNextPage } =
    useFetchUserFavourites(user?.$id as string);
  const flatData = data?.pages?.map((group) => group.documents)?.flat() || [];
  const totalCount = data?.pages?.[0].total || 0;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);

  const handleRefreshing = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<VideoDocWithStates>[];
  }) => {
    const activeItem = viewableItems.find(
      (viewable: ViewToken<VideoDocWithStates>) => viewable.isViewable
    );

    if (activeItem) {
      setActiveItemKey(activeItem.key);
    }

    if (flatData.length && activeItemKey) {
      const itemToFetchAfter = flatData?.[flatData?.length - 2]?.$id;
      if (activeItem?.key === itemToFetchAfter) {
        if (flatData.length < totalCount) {
          fetchNextPage();
        }
      }
    }
  };
  useRefreshOnFocus(refetch);

  return (
    <SafeAreaView className="bg-background h-full">
      <FlatList
        data={flatData}
        keyExtractor={(item) => item.$id}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 30,
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item }) => (
          <VideoCard
            isActive={item.$id === activeItemKey}
            isFetching={isFetching}
            invalidatioKeyAfterLike={[
              "userFavouritesList",
              user?.$id as string,
            ]}
            cardItem={item}
            showMenu={true}
            menuOptions={{
              showFollowButton: true,
              isFollowingCreator: item?.isFollowingCreator,
              creatorId: item?.creator?.$id,
              showDeleteButton: false,
            }}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
            <View className="flex justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.username}
                </Text>
              </View>

              <View className="mt-1.5">
                <Image
                  source={IMAGES.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshing}
          />
        }
        ListEmptyComponent={() => (
          <>
            {isPending ? (
              <View className="flex flex-row items-center justify-center w-full">
                <Loader />
              </View>
            ) : (
              <ProcessStatus
                title="No Videos Found!"
                subtitle="No videos added to favourites yet"
                button={{
                  title: "Back to explore",
                  handlePressing: () => router.push("/home"),
                }}
              >
                <Image
                  source={IMAGES.empty}
                  resizeMode="contain"
                  className="w-full h-full"
                />
              </ProcessStatus>
            )}
          </>
        )}
      />
    </SafeAreaView>
  );
};

export default Favourites;
