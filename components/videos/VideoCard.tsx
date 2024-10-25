import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";

import {
  ResizeMode,
  Video,
  VideoFullscreenUpdate,
  VideoFullscreenUpdateEvent,
} from "expo-av";
import VideoActionsMenu from "./VideoActionsMenu";
import { Button, Loader } from "../ui";
import { FontAwesome5 } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";
import * as ScreenOrientation from "expo-screen-orientation";
import { mergeClasses } from "@/utils/twMerge";
import { useAddToFavourites, useRemoveFavourites } from "@/hooks/useUser";
import { useLikeVideo, useUnLikeVideo } from "@/hooks/useVideo";
import { VideoDocWithStates } from "@/types/video";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

export type ConditionalActionsMenuOptions<
  T extends boolean,
  U extends boolean
> = {
  showDeleteButton: T;
  showFollowButton: U;
} & (T extends true
  ? { postId: string; creatorId: string }
  : { postId?: string; creatorId?: string }) &
  (U extends true
    ? { creatorId: string; isFollowingCreator: boolean }
    : { creatorId?: string; isFollowingCreator?: boolean });

type ConditionalMenu<T extends boolean, U extends boolean> =
  | {
      showMenu: true;
      menuOptions: ConditionalActionsMenuOptions<T, U>;
    }
  | {
      showMenu: false;
      menuOptions?: ConditionalActionsMenuOptions<T, U>;
    };
const VideoCard = <T extends boolean, U extends boolean>({
  cardItem,
  isActive,
  showMenu = true,
  menuOptions,
  showActionsButtons = true,
  isFetching = false,
  invalidatioKeyAfterLike,
}: {
  cardItem: VideoDocWithStates;
  isActive: boolean;
  showActionsButtons?: boolean;
  isFetching?: boolean;
  invalidatioKeyAfterLike: string[];
} & ConditionalMenu<T, U>) => {
  const {
    title,
    video: videoUrl,
    poster: posterUrl,
    $id: videoId,
    isAddedToFavourites,
    isLikedPost,
    likesCount,
    creator,
  } = cardItem;
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: user } = useGetCurrentUserInfo();

  const handleLoadingStart = () => {
    setIsLoading(true);
  };
  const handleLoading = () => {
    setIsLoading(false);
  };

  const handleFullScreenUpdate = (event: VideoFullscreenUpdateEvent) => {
    if (event.status?.isLoaded) {
      switch (event.fullscreenUpdate) {
        case VideoFullscreenUpdate.PLAYER_DID_PRESENT:
          ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
          );
          break;
        case VideoFullscreenUpdate.PLAYER_WILL_DISMISS:
          ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    const handlePlaying = async () => {
      if (videoRef.current) {
        if (!isActive) {
          await videoRef.current.pauseAsync();
        }
      }
    };
    handlePlaying();
  }, [isActive]);
  // add/remove from favourites
  const { mutate: mutateAdd } = useAddToFavourites();

  const { mutate: mutateRemove } = useRemoveFavourites();

  const handleAddingToFav = async () => {
    mutateAdd({
      postToAdd: videoId,
      invalidate: invalidatioKeyAfterLike,
    });
  };
  const handleRemovingFromFav = async () => {
    mutateRemove({
      postToRemove: videoId,
      invalidate: invalidatioKeyAfterLike,
    });
  };
  // like/dislike
  const { mutate: mutateLike } = useLikeVideo();
  const { mutate: mutateUnLike } = useUnLikeVideo();

  const handleLikingVideo = () => {
    mutateLike({
      postId: videoId,
      invalidate: invalidatioKeyAfterLike,
    });
  };
  const handleUnLikingVideo = () => {
    mutateUnLike({
      postId: videoId,
      invalidate: invalidatioKeyAfterLike,
    });
  };

  return (
    <View
      className={mergeClasses(
        "flex items-center gap-2 mb-14 px-4 relative",
        isFetching && "opacity-50"
      )}
    >
      <View className="flex flex-row items-center justify-between">
        <View className="flex items-center flex-row flex-1 gap-2">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center p-0.5">
            <Image
              source={{ uri: creator?.avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex flex-1 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {creator?.username}
            </Text>
          </View>
        </View>
        {showMenu && menuOptions && (
          <VideoActionsMenu
            videoItem={menuOptions}
            invalidationKey={invalidatioKeyAfterLike}
          />
        )}
      </View>
      {isPlayingVideo ? (
        <>
          <Video
            source={{ uri: videoUrl }}
            ref={videoRef}
            className="w-full h-72 rounded-xl mt-3 bg-white/10"
            resizeMode={ResizeMode.STRETCH}
            useNativeControls={!isLoading}
            shouldPlay={!isLoading}
            onLoad={handleLoading}
            onLoadStart={handleLoadingStart}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish) {
                setIsPlayingVideo(false);
              }
            }}
            onFullscreenUpdate={handleFullScreenUpdate}
          />
          {isLoading && (
            <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Loader />
            </View>
          )}
        </>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsPlayingVideo(true)}
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
        >
          <Image
            source={{ uri: posterUrl }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />

          <View className="absolute top-[44%] left-[43%] bg-white/20 rounded-full">
            <FontAwesome5
              name="play-circle"
              size={50}
              color={THEME.colors.gray["100"]}
            />
          </View>
        </TouchableOpacity>
      )}
      {showActionsButtons && cardItem?.creator?.$id !== user?.$id && (
        <View className="w-full flex flex-row items-center">
          <View className="flex flex-row items-center gap-1">
            {isLikedPost && (
              <Button
                onPress={handleUnLikingVideo}
                variant={"ghost"}
                size={"icon"}
              >
                <FontAwesome5
                  name="thumbs-down"
                  size={24}
                  color={THEME.colors.gray["100"]}
                />
              </Button>
            )}
            {!isLikedPost && (
              <Button
                onPress={handleLikingVideo}
                variant={"ghost"}
                size={"icon"}
              >
                <FontAwesome5
                  name="thumbs-up"
                  size={24}
                  color={THEME.colors.gray["100"]}
                />
              </Button>
            )}

            <Text className="text-gray-200 font-pregular text-sm">
              {likesCount}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1 ml-4">
            {isAddedToFavourites ? (
              <Button
                onPress={handleRemovingFromFav}
                variant={"ghost"}
                size={"icon"}
              >
                <FontAwesome5
                  name="heart-broken"
                  size={24}
                  color={THEME.colors.gray["100"]}
                />
              </Button>
            ) : (
              <Button
                onPress={handleAddingToFav}
                variant={"ghost"}
                size={"icon"}
              >
                <FontAwesome5
                  name="heart"
                  size={24}
                  color={THEME.colors.gray["100"]}
                />
              </Button>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default VideoCard;
