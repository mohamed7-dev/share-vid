import { Models } from "react-native-appwrite";
import { EssentialUserInfo, VideoRecord } from "./video";

export interface User {
  username: string;
  avatar: string;
  email: string;
  accountId: string;
  following: string[];
  followers: string[];
  favourites: string[];
}

// this type represents user record returned from server
export interface UserRecord extends Models.Document, User {}
export interface UsersRecordList
  extends Models.DocumentList<Models.Document & User> {}

// this type returned from the server when requesting following list
export interface FollowingListWithRecentPosts {
  data: {
    userInfo: Models.Document & Pick<UserRecord, "username" | "avatar">;
    recentPosts: Models.DocumentList<
      Models.Document & Pick<VideoRecord, "poster">
    >;
  }[];
  nextPage: number | undefined;
}
// this type returned from profile stats on the server
export interface ProfileStats {
  postsCount: number;
  following: number;
  followers: number;
}

// this type returned from user favourites on the server
export interface UserFavourites {
  data: VideoRecord[];
  isNext: boolean;
}

// user info sent to UI
export interface UserInfoToUI
  extends Pick<Models.Document, "$id" | "$createdAt" | "$updatedAt">,
    EssentialUserInfo {}
