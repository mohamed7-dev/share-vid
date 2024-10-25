import { getCurrentUserInfo } from "@/lib/user";
import { VideoDocWithStates, VideoRecord } from "@/types/video";
import { handleError } from "./error";
import { ServerError } from "@/types/config";
import { UserInfoToUI, UserRecord } from "@/types/user";

export const removeSensitiveFields = <T extends { [key: string]: any }>(
  object: T,
  fields: string[]
) => {
  if (typeof object === "object") {
    return fields.forEach((item) => delete object[item]);
  } else {
    return object;
  }
};

export const returnVideosToUI = async (records: VideoRecord[]) => {
  try {
    const currentUser = await getCurrentUserInfo({ returnToUI: false });

    if ("error" in currentUser) {
      if (currentUser.status === 401 || currentUser.status === 403) {
        // states are not needed if there is no session
        return records.map((video) => {
          return {
            $id: video.$id,
            $createdAt: video.$createdAt,
            $updatedAt: video.$updatedAt,
            poster: video.poster,
            video: video.video,
            title: video.title,
            creator: {
              username: video.creator.username,
              email: video.creator.email,
              avatar: video.creator.avatar,
              $id: video.creator.$id,
            },
            isAddedToFavourites: false,
            isFollowingCreator: false,
            isLikedPost: false,
            likesCount: video.likes.length,
          } as VideoDocWithStates;
        });
      } else {
        return currentUser as ServerError;
      }
    }
    if ("following" in currentUser && "favourites" in currentUser) {
      const followingsList = currentUser.following;
      const favouritesList = currentUser.favourites;
      const videosWithStates = records?.map((video) => {
        const isFav = favouritesList.some((fav) => fav === video.$id);
        const isLiked = video.likes.some((like) => like === currentUser.$id);
        const isFollowingCreator = followingsList.some(
          (user) => user === video?.creator?.$id
        );
        return {
          $id: video.$id,
          $createdAt: video.$createdAt,
          $updatedAt: video.$updatedAt,
          poster: video.poster,
          video: video.video,
          title: video.title,
          creator: {
            username: video.creator?.username,
            email: video.creator?.email,
            avatar: video.creator?.avatar,
            $id: video.creator?.$id,
          },
          isAddedToFavourites: isFav,
          isFollowingCreator,
          isLikedPost: isLiked,
          likesCount: video.likes.length,
        } as VideoDocWithStates;
      });

      return videosWithStates;
    } else {
      throw new Error("Something went wrong!");
    }
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const returnUserInfoToUI = (records: UserRecord[]) => {
  return records.map((record) => {
    return {
      $id: record.$id,
      $updatedAt: record?.$updatedAt,
      $createdAt: record?.$createdAt,
      username: record?.username,
      email: record?.email,
      avatar: record?.avatar,
    } as UserInfoToUI;
  });
};
