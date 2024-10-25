import { APPWRITE_CONFIG } from "@/constants/app";
import { account, databases } from "./appwrite";
import { Models, Query } from "react-native-appwrite";
import {
  FollowingListWithRecentPosts,
  ProfileStats,
  User,
  UserInfoToUI,
  UserRecord,
  UsersRecordList,
} from "@/types/user";
import { handleError } from "@/utils/error";
import {
  EssentialUserInfo,
  VideoRecord,
  VideoRecordsList,
} from "@/types/video";
import { ServerError } from "@/types/config";

export const getAccountInfo = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) {
      return handleError("Unauthorized, Login in first!", 401);
    }
    return currentAccount;
  } catch (error) {
    return handleError((error as Error).message, 500);
  }
};

export const getCurrentUserInfo = async ({
  returnToUI,
}: {
  returnToUI: boolean;
}): Promise<ServerError | UserRecord | UserInfoToUI> => {
  try {
    const currentAccount = await getAccountInfo();
    if ("error" in currentAccount) {
      return currentAccount as ServerError;
    }
    const currentUser = (await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    )) as UsersRecordList;

    const user = currentUser?.documents?.[0];

    const basic = {
      $id: user?.$id,
      $updatedAt: user?.$updatedAt,
      $createdAt: user?.$createdAt,
      username: user?.username,
      email: user?.email,
      avatar: user?.avatar,
    };

    if (returnToUI) {
      return basic as UserInfoToUI;
    } else {
      return user as UserRecord;
    }
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const followUser = async (userToFollowId: string) => {
  if (!userToFollowId) {
    return handleError("Please, make sure to pass required data!", 400);
  }

  try {
    // update the following list of the loggedin user
    const currentUser = await getCurrentUserInfo({ returnToUI: false });
    if ("error" in currentUser) {
      return currentUser as ServerError;
    }
    if (userToFollowId === currentUser?.$id) {
      return handleError(
        "Invalid request, you can't follow your account!",
        400
      );
    }
    if ("following" in currentUser) {
      const following = currentUser.following;
      const foundUser = following.find((item) => item === userToFollowId);
      if (foundUser) {
        return handleError("You are following this profile already!", 400);
      }
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        currentUser?.$id,
        { following: [...following, userToFollowId] }
      );
    }

    // update the followers list of the followed user
    const followedUser = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userToFollowId
    )) as UserRecord;

    const followers = followedUser.followers;
    return await databases
      .updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        userToFollowId,
        { followers: [...followers, currentUser?.$id] }
      )
      .then(() => {
        return { userBeingFollowed: userToFollowId, done: true };
      });
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const unfollowUser = async (userToUnFollowId: string) => {
  if (!userToUnFollowId) {
    return handleError("Please, make sure to pass required data!", 400);
  }

  try {
    // update the following list of the loggedin user
    const currentUser = await getCurrentUserInfo({ returnToUI: false });
    if ("error" in currentUser) {
      return currentUser as ServerError;
    }
    if (userToUnFollowId === currentUser?.$id) {
      return handleError(
        "Invalid request, you can't unfollow your account!",
        400
      );
    }

    if ("following" in currentUser) {
      const filteredList = currentUser.following.filter(
        (item) => item !== userToUnFollowId
      );

      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        currentUser?.$id,
        { following: [...filteredList] }
      );
    }
    // update the followers list of the followed user
    const followedUser = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userToUnFollowId
    )) as UserRecord;
    const filteredFollowers = followedUser.followers.filter(
      (item) => item !== currentUser?.$id
    );
    return await databases
      .updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        userToUnFollowId,
        { followers: [...filteredFollowers] }
      )
      .then(() => {
        return { userBeingUnFollowed: userToUnFollowId, done: true };
      });
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const getFollowingList = async (userId: string, page: number) => {
  if (!userId) {
    return handleError("Please, make sure to pass required data!", 400);
  }

  try {
    const userInfo = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userId,
      [Query.select(["following"])]
    )) as Models.Document & Pick<User, "following">;

    // always get 10 items
    const subList = userInfo.following.slice(page * 10, page * 10 + 10);

    if (subList.length) {
      const res = await Promise.all(
        subList.map(async (id) => {
          const userInfo = (await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollectionId,
            id,
            [Query.select(["username", "avatar", "$id", "email"])]
          )) as Models.Document & EssentialUserInfo;

          // Fetch the two most recent posts for this user
          const posts = (await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.videosCollectionId,
            [
              Query.equal("creator", id),
              Query.orderDesc("$createdAt"),
              Query.limit(2),
              Query.select(["poster"]),
            ]
          )) as Models.DocumentList<
            Models.Document & Pick<VideoRecord, "poster">
          >;

          return {
            userInfo,
            recentPosts: posts,
          };
        })
      );
      return {
        data: res,
        nextPage: subList.length === 10 ? page + 1 : undefined,
        total: userInfo.following,
      } as FollowingListWithRecentPosts;
    } else {
      return {
        data: [],
        nextPage: undefined,
        total: userInfo.following,
      } as FollowingListWithRecentPosts;
    }
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const getProfileStats = async (userId: string) => {
  if (!userId) {
    return handleError("Please, make sure to pass required data!", 400);
  }
  try {
    const stats = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userId,
      [Query.select(["following", "followers"])]
    )) as Models.Document & Pick<User, "following" | "followers">;

    const posts = (await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      [Query.equal("creator", userId), Query.limit(1)]
    )) as VideoRecordsList;

    return {
      postsCount: posts.total,
      following: stats.following.length,
      followers: stats.followers.length,
    } as ProfileStats;
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const addToFavourites = async (postId: string) => {
  if (!postId) {
    return handleError("Please, make sure to pass required data!", 400);
  }
  try {
    const currentUser = await getCurrentUserInfo({ returnToUI: false });
    if ("error" in currentUser) {
      return currentUser as ServerError;
    }
    if ("favourites" in currentUser) {
      const favouritePosts = currentUser.favourites;
      const foundPost = favouritePosts.find((item) => item === postId);
      if (foundPost) {
        return handleError(
          "You have already added this post to favourites!",
          400
        );
      }
      return await databases
        .updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.usersCollectionId,
          currentUser?.$id,
          { favourites: [...favouritePosts, postId] }
        )
        .then(() => {
          return {
            postAddedToFavourites: postId,
            added: true,
          };
        });
    } else {
      throw new Error("Something went wrong!");
    }
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const removeFromFavourites = async (postId: string) => {
  if (!postId) {
    return handleError("Please, make sure to pass required data!", 400);
  }
  try {
    const currentUser = await getCurrentUserInfo({ returnToUI: false });
    if ("error" in currentUser) {
      return currentUser as ServerError;
    }
    if ("favourites" in currentUser) {
      const favouritePosts = currentUser.favourites;
      const filteredList = favouritePosts.filter((item) => item !== postId);
      return await databases
        .updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.usersCollectionId,
          currentUser?.$id,
          { favourites: [...filteredList] }
        )
        .then(() => {
          return {
            removedPost: postId,
            removed: true,
          };
        });
    } else {
      throw new Error("Something went wrong!");
    }
  } catch (error) {
    return handleError((error as Error).message);
  }
};
