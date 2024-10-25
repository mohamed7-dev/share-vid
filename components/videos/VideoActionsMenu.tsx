import { View, Text } from "react-native";
import React, { useRef, useState } from "react";
import { BottomSheet, Button } from "../ui";
import { THEME } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFollow, useUnFollow } from "@/hooks/useUser";
import { useDeleteVideo } from "@/hooks/useVideo";
import { BottomSheetRef } from "../ui/BottomSheet";
import { ConditionalActionsMenuOptions } from "./VideoCard";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const VideoActionsMenu = <T extends boolean, U extends boolean>({
  videoItem,
  invalidationKey,
}: {
  videoItem: ConditionalActionsMenuOptions<T, U>;
  invalidationKey: string[];
}) => {
  const { data: user } = useGetCurrentUserInfo();
  const bottomDrawerRef = useRef<BottomSheetRef>(null);
  const [isFollowingCreator, setIsFollowingCreator] = useState(
    videoItem?.isFollowingCreator
  );

  const handleVisibility = () => {
    bottomDrawerRef.current?.collapse();
  };

  // follow/unfollow creators
  const { mutate: mutateFollowing } = useFollow();
  const { mutate: mutateUnfollowing } = useUnFollow();
  const handleFollowingUser = () => {
    if (videoItem.showFollowButton && videoItem.creatorId) {
      mutateFollowing(
        {
          userToFollowId: videoItem.creatorId,
          invalidate: invalidationKey,
        },
        {
          onSuccess: () => setIsFollowingCreator(true),
          onError: () => setIsFollowingCreator(false),
          onSettled: () => handleVisibility(),
        }
      );
    }
  };
  const handleUnfollowingUser = () => {
    if (videoItem.showFollowButton && videoItem.creatorId) {
      mutateUnfollowing(
        {
          userToUnFollowId: videoItem.creatorId,
          invalidate: invalidationKey,
        },
        {
          onSuccess: () => setIsFollowingCreator(false),
          onError: () => setIsFollowingCreator(true),
          onSettled: () => handleVisibility(),
        }
      );
    }
  };

  // delete post
  const { mutate: mutateDelete } = useDeleteVideo();
  const handleDeletingVideo = () => {
    if (videoItem.showDeleteButton && videoItem.postId) {
      mutateDelete(
        {
          postId: videoItem.postId,
        },
        { onSettled: () => handleVisibility() }
      );
    }
  };

  if (!videoItem.showDeleteButton && !videoItem.showFollowButton) {
    return null;
  }
  return (
    <>
      <Button
        onPress={() => bottomDrawerRef.current?.expand()}
        variant={"ghost"}
        size={"icon"}
      >
        <FontAwesome5
          name="ellipsis-v"
          size={24}
          color={THEME.colors.gray["100"]}
        />
      </Button>

      <BottomSheet handleBackdropClick={handleVisibility} ref={bottomDrawerRef}>
        <View className="flex">
          {videoItem.showFollowButton && (
            <>
              {isFollowingCreator ? (
                <Button variant={"ghost"} onPress={handleUnfollowingUser}>
                  <View className="flex flex-1 flex-row gap-4 items-center justify-start">
                    <FontAwesome5
                      name="user-minus"
                      size={24}
                      color={THEME.colors.primary}
                    />
                    <Text className="text-primary font-pmedium text-lg capitalize">
                      unfollow creator
                    </Text>
                  </View>
                </Button>
              ) : (
                <Button variant={"ghost"} onPress={handleFollowingUser}>
                  <View className="flex flex-1 flex-row gap-x-4 items-center ">
                    <FontAwesome5
                      name="user-plus"
                      size={24}
                      color={THEME.colors.primary}
                    />
                    <Text className="text-primary font-pmedium text-lg capitalize">
                      follow creator
                    </Text>
                  </View>
                </Button>
              )}
            </>
          )}
          {videoItem.showDeleteButton && (
            <>
              {videoItem.creatorId === (user?.$id as string) && (
                <Button variant={"ghost"} onPress={handleDeletingVideo}>
                  <View className="flex flex-1 flex-row gap-x-4 items-center ">
                    <FontAwesome5
                      name="trash"
                      size={24}
                      color={THEME.colors.primary}
                    />
                    <Text className="text-primary font-pmedium text-lg capitalize">
                      delete video
                    </Text>
                  </View>
                </Button>
              )}
            </>
          )}
        </View>
      </BottomSheet>
    </>
  );
};

export default VideoActionsMenu;
