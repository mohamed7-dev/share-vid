import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  ViewToken,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoCard from "@/components/videos/VideoCard";
import IMAGES from "@/constants/images";
import { LatestVideos } from "@/tab/home";
import { ProcessStatus } from "@/generic/index";
import { router } from "expo-router";
import { VideoDocWithStates } from "@/types/video";
import { Loader, SearchInput } from "@/components/ui";
import { useFetchAllVideos, useFetchRecentVideos } from "@/hooks/useVideo";
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const Home = () => {
  const { data: userInfo } = useGetCurrentUserInfo();

  const {
    data: allVideos,
    fetchNextPage,
    refetch,
    isPending: isLoadingAllVideos,
    isFetching: isFetchingAllVideos,
  } = useFetchAllVideos();

  const flatAllVideos = allVideos
    ? allVideos.pages.map((group) => group.documents).flat()
    : [];

  const { data: recentVideos, isPending, isFetching } = useFetchRecentVideos();
  const totalVideosCount = allVideos ? allVideos?.pages[0]?.total : 0;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);

  const handleRefreshing = async () => {
    setIsRefreshing(true);
    refetch();
    setIsRefreshing(false);
  };

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<VideoDocWithStates>[];
  }) => {
    const activeItem = viewableItems.find(
      (viewable: any) => viewable.isViewable
    );

    if (activeItem) {
      setActiveItemKey(activeItem.key);
    }
    if (flatAllVideos.length && activeItemKey) {
      const itemToFetchAfter = flatAllVideos?.[flatAllVideos?.length - 2]?.$id;
      if (activeItem?.key === itemToFetchAfter) {
        if (flatAllVideos.length < totalVideosCount) {
          fetchNextPage();
        }
      }
    }
  };
  // refetch on window focus
  useRefreshOnFocus(refetch);

  return (
    <SafeAreaView className="bg-background">
      <FlatList
        data={flatAllVideos}
        keyExtractor={(item) => item?.$id}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item }) => (
          <VideoCard
            isActive={item?.$id === activeItemKey}
            isFetching={isFetchingAllVideos}
            invalidatioKeyAfterLike={["allVideos"]}
            cardItem={item}
            showMenu={true}
            menuOptions={{
              showDeleteButton: false,
              showFollowButton: item.creator.$id !== (userInfo?.$id as string),
              creatorId: item.creator.$id,
              postId: item.$id,
              isFollowingCreator: item.isFollowingCreator,
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
                  {userInfo?.username}
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

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Latest Videos
              </Text>
              {isPending ? (
                <View className="flex flex-1 w-full h-full items-center justify-center">
                  <Loader />
                </View>
              ) : (
                <LatestVideos
                  items={recentVideos?.documents || []}
                  isPending={isPending}
                  isFetching={isFetching}
                />
              )}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshing}
          />
        }
        ListEmptyComponent={() => {
          if (isLoadingAllVideos) {
            return (
              <View className="w-full h-[50vh] flex flex-row flex-1 items-center justify-center">
                <Loader />
              </View>
            );
          } else {
            return (
              <ProcessStatus
                title="No Videos Found!"
                subtitle="Be the first publisher"
                button={{
                  title: "Create new video",
                  handlePressing: () => router.push("/create"),
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
    </SafeAreaView>
  );
};

export default Home;
