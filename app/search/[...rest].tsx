import { View, Text, FlatList, Image, ViewToken } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoCard } from "@/components/videos";
import { ProcessStatus } from "@/components/generic";
import { router, useLocalSearchParams } from "expo-router";
import IMAGES from "@/constants/images";
import useDebounce from "@/hooks/useDebounce";
import { Loader, SearchInput } from "@/components/ui";
import { FILTER_OPTIONS, VIEWABILITY_CONFIG } from "@/constants/app";
import { useSearch } from "@/hooks/useVideo";
import { VideoDocWithStates } from "@/types/video";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const Search = () => {
  const { rest }: { rest: string[] } = useLocalSearchParams();
  const { data: user } = useGetCurrentUserInfo();
  const query = rest[0];
  const filter = rest[1] as FILTER_OPTIONS;

  const label =
    filter === FILTER_OPTIONS.FavouritesOnly
      ? "Search Results From Favourites"
      : filter === FILTER_OPTIONS.CreatedOnly
      ? "Search Results From Your videos"
      : "Search Results";

  const filteredOptions =
    filter !== FILTER_OPTIONS.EveryThing
      ? {
          searchFavouritesOnly:
            filter === FILTER_OPTIONS.FavouritesOnly ? true : false,
          searchCreatedOnly:
            filter === FILTER_OPTIONS.CreatedOnly ? true : false,
          userId: user?.$id as string,
        }
      : undefined;

  const debouncedQuery = useDebounce({ state: query as string, time: 500 });

  const {
    data: searchResults,
    refetch,
    fetchNextPage,
    isPending,
  } = useSearch(query, filteredOptions);
  const flatData =
    searchResults?.pages?.map((group) => group.documents)?.flat() || [];
  const totalVideosCount = searchResults?.pages?.[0]?.total || 0;
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, [debouncedQuery, refetch]);

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
  return (
    <SafeAreaView className="bg-background h-full">
      <FlatList
        data={flatData}
        keyExtractor={(item) => item.$id}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item }) => (
          <VideoCard
            showMenu={true}
            menuOptions={{
              showFollowButton: true,
              showDeleteButton: false,
              creatorId: item.creator.$id,
              isFollowingCreator: item.isFollowingCreator,
            }}
            cardItem={item}
            isActive={true}
            invalidatioKeyAfterLike={["searchPosts", query]}
          />
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex my-6 px-4">
              <Text className="font-pmedium text-gray-100 text-sm">
                {label}
              </Text>
              <Text className="text-2xl font-psemibold text-white mt-1">
                {query}
              </Text>

              <View className="mt-6 mb-8">
                <SearchInput initialQuery={query as string} />
              </View>
            </View>
          </>
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
                subtitle="No videos found for this search query"
                button={{
                  title: "Back to explore",
                  handlePressing: () => router.push("/home"),
                }}
              >
                <Image
                  source={IMAGES.empty}
                  resizeMode="contain"
                  className="w-[270px] h-[216px]"
                />
              </ProcessStatus>
            )}
          </>
        )}
      />
    </SafeAreaView>
  );
};

export default Search;
