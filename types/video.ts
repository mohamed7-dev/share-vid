import { DocumentPickerAsset } from "expo-document-picker";
import { UserRecord } from "./user";
import { Models } from "react-native-appwrite";

export type CreateVideoForm = {
  title: string;
  thumbnail: null | DocumentPickerAsset;
  video: null | DocumentPickerAsset;
  creator: string;
};

export interface Video {
  title: string;
  poster: string;
  video: string;
  creator: UserRecord;
  likes: string[];
}

export type EssentialUserInfo = Pick<
  UserRecord,
  "email" | "avatar" | "username" | "$id"
>;

// this type represents document list data returned from the database
export interface VideoRecordsList
  extends Models.DocumentList<Models.Document & Video> {}

// type for single record returned from the database
export interface VideoRecord extends Models.Document, Video {}

// type for data returned to front-end
export interface VideoToUI
  extends Pick<Models.Document, "$id" | "$updatedAt" | "$createdAt">,
    Omit<Video, "likes" | "creator"> {
  isFollowingCreator: boolean;
  isAddedToFavourites: boolean;
  isLikedPost: boolean;
  likesCount: number;
  creator: EssentialUserInfo;
}

// video record with file ids
export interface VideoRecordWithFileIds extends VideoRecord {
  thumbnailFileId?: string;
  videoFileId?: string;
}

// type for paginated data
export interface PaginatedVideoRecordsList extends VideoRecordsList {
  cursor: string | undefined;
}

// type represents list of videos with states on them relative to the
// logged in user
export interface VideoDocWithStates extends VideoToUI {}

export interface PaginatedVideoRecordsListWithStates
  extends Omit<PaginatedVideoRecordsList, "documents"> {
  documents: VideoDocWithStates[];
}

export interface VideoRecordsListWithStates
  extends Omit<PaginatedVideoRecordsList, "documents" | "cursor"> {
  documents: VideoDocWithStates[];
}
