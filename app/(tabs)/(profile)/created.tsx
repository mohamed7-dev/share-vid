import { View, FlatList, Image, ViewToken } from "react-native";
import React, { useState } from "react";
import VideoCard from "@/components/videos/VideoCard";
import { ProcessStatus } from "@/components/generic";
import { router } from "expo-router";
import IMAGES from "@/constants/images";
import { VIEWABILITY_CONFIG } from "@/constants/app";
import { VideoDocWithStates } from "@/types/video";
import { useFetchUserVideos } from "@/hooks/useVideo";
import { Loader } from "@/components/ui";
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const Created = () => {
  const { data: user } = useGetCurrentUserInfo();

  const { data, fetchNextPage, isPending, refetch } = useFetchUserVideos(
    user?.$id as string
  );
  const flatData = data
    ? data?.pages?.map((group) => group.documents).flat()
    : [];
  const totalVideosCount = data?.pages?.[0]?.total || 0;
  const [activeItemKey, setActiveItemKey] = useState(
    flatData ? flatData[0]?.$id : ""
  );

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

    if (flatData.length && activeItemKey) {
      const itemToFetchAfter = flatData?.[flatData?.length - 2]?.$id;
      if (activeItem?.key === itemToFetchAfter) {
        if (flatData.length < totalVideosCount) {
          fetchNextPage();
        }
      }
    }
  };
  useRefreshOnFocus(refetch);
  return (
    <View className="bg-background h-full">
      <FlatList
        data={flatData}
        keyExtractor={(item) => item.$id}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item }) => (
          <VideoCard
            isActive={item.$id === activeItemKey}
            cardItem={item}
            showMenu={true}
            menuOptions={{
              showDeleteButton: true,
              showFollowButton: false,
              postId: item.$id,
              creatorId: item.creator.$id,
            }}
            showActionsButtons={false}
            invalidatioKeyAfterLike={["userVideos", user?.$id as string]}
          />
        )}
        ListEmptyComponent={() => (
          <>
            {isPending ? (
              <View className="w-full flex flex-row items-center justify-center">
                <Loader />
              </View>
            ) : (
              <ProcessStatus
                title="No Videos Found"
                subtitle="No videos found for this profile"
                button={{
                  title: "Go to create post",
                  handlePressing: () => router.push("/create"),
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
    </View>
  );
};

export default Created;
