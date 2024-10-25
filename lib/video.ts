import {
  CreateVideoForm,
  VideoDocWithStates,
  PaginatedVideoRecordsListWithStates,
  VideoRecord,
  VideoRecordsList,
  VideoRecordsListWithStates,
  VideoRecordWithFileIds,
} from "@/types/video";
import { deleteFile, uploadFile } from "./generics";
import { databases } from "./appwrite";
import { APPWRITE_CONFIG } from "@/constants/app";
import { ID, Models, Query } from "react-native-appwrite";
import { handleError } from "@/utils/error";
import {
  FilterOptions,
  FilterOptionsWithUserId,
  ServerError,
} from "@/types/config";
import { User, UserRecord } from "@/types/user";
import { returnVideosToUI } from "@/utils/cleanRecords";
import { getCurrentUserInfo } from "./user";

const LIMIT = 10;

export const createVideo = async (formData: CreateVideoForm) => {
  if (!formData) {
    return handleError("please, make sure to fill in all fields!", 400);
  }
  if (!formData.thumbnail || !formData.video) {
    return handleError("please, make sure to provide all required data!", 400);
  }
  try {
    // save files to storage ["image","video"];
    const [thumbnail, video] = await Promise.all([
      uploadFile(formData.thumbnail, "Image"),
      uploadFile(formData.video, "Video"),
    ]);
    if ("error" in thumbnail) {
      return thumbnail;
    }
    if ("error" in video) {
      return video;
    }
    // create document in the db
    const newVideoPost = (await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      ID.unique(),
      {
        title: formData.title,
        poster: thumbnail.url,
        thumbnailFileId: thumbnail.fileId,
        video: video.url,
        videoFileId: video.fileId,
        creator: formData.creator,
      }
    )) as VideoRecordWithFileIds;
    // we don't need to expose these to front end
    const cleanedVideo = await returnVideosToUI([newVideoPost]);
    if ("error" in cleanedVideo) {
      return cleanedVideo as ServerError;
    }
    return cleanedVideo?.[0] as VideoDocWithStates;
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const getAllVideos = async (cursor?: string) => {
  // fetch one extra doc to check if there is data remaining.
  const query = [Query.limit(LIMIT + 1)];
  // if cursor passed, it means data is paginated
  if (cursor) query.push(Query.cursorAfter(cursor));
  try {
    const videos = (await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      query
    )) as VideoRecordsList;

    const videosWithStates = await returnVideosToUI(videos?.documents);

    if ("error" in videosWithStates) {
      return videosWithStates as ServerError;
    }
    const hasMore = videos.documents.length > LIMIT;
    const data = hasMore ? videos.documents.slice(0, LIMIT) : videos.documents;
    const lastItemId = hasMore ? data[data.length - 1].$id : undefined;
    return {
      ...videos,
      documents: videosWithStates,
      cursor: lastItemId,
    } as PaginatedVideoRecordsListWithStates;
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const getRecentVideos = async () => {
  try {
    const videos = (await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    )) as VideoRecordsList;
    const videosWithStates = await returnVideosToUI(videos?.documents);
    if ("error" in videosWithStates) {
      return videosWithStates as ServerError;
    }
    return {
      ...videos,
      documents: videosWithStates,
    } as VideoRecordsListWithStates;
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const getVideoStats = async (videoId: string) => {
  try {
    const video = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      videoId,
      [Query.select(["likes"])]
    )) as Models.Document & Pick<VideoRecord, "likes">;

    return {
      likesCount: video.likes.length,
    };
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const getUserVideos = async (userId: string, cursor?: string) => {
  if (!userId) {
    return handleError("Please, make sure user info is provided!", 400);
  }
  try {
    const query = [Query.limit(LIMIT + 1)];
    if (cursor) {
      query.push(Query.cursorAfter(cursor));
    }
    const videos = (await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      [Query.equal("creator", userId), ...query]
    )) as VideoRecordsList;

    const hasMore = videos.documents.length > LIMIT;
    const data = hasMore ? videos.documents.slice(0, LIMIT) : videos.documents;
    const lastItemId = hasMore ? data[data.length - 1].$id : undefined;
    const videosWithStates = await returnVideosToUI(videos?.documents);
    if ("error" in videosWithStates) {
      return videosWithStates as ServerError;
    }
    return {
      ...videos,
      documents: videosWithStates,
      cursor: lastItemId,
    } as PaginatedVideoRecordsListWithStates;
  } catch (error) {
    return handleError((error as Error).message);
  }
};

const getSavedVideos = async (subList: string[]) => {
  const allFavourites = await Promise.all(
    subList?.map(async (post) => {
      const video = (await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.videosCollectionId,
        post
      )) as VideoRecord;
      return video;
    })
  );
  const docsWithStates = await returnVideosToUI(allFavourites);
  return docsWithStates;
};

const getCursor = (result: VideoDocWithStates[]) => {
  const hasMore = result.length > LIMIT;
  const data = hasMore ? result.slice(0, LIMIT) : result;
  const lastItemId = hasMore ? data[data.length - 1].$id : undefined;
  return lastItemId;
};
export const getAllFavourites = async (userId: string, cursor?: string) => {
  try {
    const user = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userId,
      [Query.select(["favourites"])]
    )) as Models.Document & Pick<User, "favourites">;

    const userFav = user?.favourites;
    if (cursor) {
      // always get 10 items
      const startIndex = userFav.indexOf(cursor);
      // always add 1 extra item so that we can check if there is other data
      const endIndex = startIndex + LIMIT + 1;
      const subList = userFav.slice(startIndex, endIndex);
      const result = await getSavedVideos(subList);
      if ("error" in result) {
        return result as ServerError;
      }
      return {
        documents: result,
        cursor: getCursor(result),
        total: userFav.length,
      } as PaginatedVideoRecordsListWithStates;
    } else {
      // get first 10 items
      const subList = user.favourites.slice(0, 10);
      console.log("initial fetching", subList);

      const result = await getSavedVideos(subList);
      if ("error" in result) {
        return result as ServerError;
      }
      return {
        documents: result,
        cursor: getCursor(result),
        total: userFav.length,
      } as PaginatedVideoRecordsListWithStates;
    }
  } catch (error) {
    return handleError((error as Error).message, 500);
  }
};

const searchByTitle = async (
  query: string,
  cursor?: string,
  searchCreatedOnly?: boolean,
  userId?: string
) => {
  const queryConfig = [Query.limit(LIMIT + 1)];
  const searchConfig = Query.contains("title", query);
  if (cursor) {
    queryConfig.push(Query.cursorAfter(cursor));
  }
  if (searchCreatedOnly && userId) {
    queryConfig.push(Query.and([searchConfig, Query.equal("creator", userId)]));
  } else {
    queryConfig.push(searchConfig);
  }
  const videos = (await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.videosCollectionId,
    queryConfig
  )) as VideoRecordsList;
  const hasMore = videos.documents.length > LIMIT;
  const data = hasMore ? videos.documents.slice(0, LIMIT) : videos.documents;
  const lastItemId = hasMore ? data[data.length - 1].$id : undefined;
  const videosWithStates = await returnVideosToUI(videos?.documents);
  if ("error" in videosWithStates) {
    return videosWithStates as ServerError;
  }
  return {
    ...videos,
    documents: videosWithStates,
    cursor: lastItemId,
  } as PaginatedVideoRecordsListWithStates;
};

export async function searchPosts<T extends FilterOptions>(
  query: string,
  cursor?: string,
  filterOptionsWithUserId?: FilterOptionsWithUserId<T>
) {
  if (!query) {
    return handleError("Query can't be empty!", 400);
  }

  try {
    // if no filter options passed
    // search globally
    if (!filterOptionsWithUserId) {
      return await searchByTitle(query, cursor);
    } else {
      if (!filterOptionsWithUserId.userId) {
        return handleError("Make sure user info is provided!", 400);
      } else {
        // search posts saved by the user
        if (filterOptionsWithUserId.searchFavouritesOnly) {
          const userInfo = (await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollectionId,
            filterOptionsWithUserId.userId
          )) as UserRecord;
          const userFav = userInfo.favourites;
          const results = await searchByTitle(query, cursor);
          if ("error" in results) {
            return results as ServerError;
          }
          const filteredList = results.documents.filter((item) =>
            userFav.includes(item.$id)
          );
          return { ...results, documents: filteredList };
        } else {
          // search posts created only by the user
          return await searchByTitle(
            query,
            cursor,
            true,
            filterOptionsWithUserId.userId
          );
        }
      }
    }
  } catch (error) {
    return handleError((error as Error).message);
  }
}

export async function likePost(videoId: string) {
  if (!videoId) {
    return handleError("Please, make sure required data is provided!", 400);
  }

  try {
    const currentUser = await getCurrentUserInfo({ returnToUI: false });
    if ("error" in currentUser) {
      return currentUser as ServerError;
    }
    const video = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      videoId
    )) as VideoRecord;

    if (!video) {
      return handleError("No video found!", 204);
    }
    const likes = video.likes;
    const foundUser = likes.find((item) => item === currentUser?.$id);
    if (foundUser) {
      return handleError("You have already liked this video!", 400);
    }

    return await databases
      .updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.videosCollectionId,
        videoId,
        { likes: [...likes, currentUser?.$id] }
      )
      .then(() => {
        return {
          likedPost: videoId,
          liked: true,
        };
      });
  } catch (error) {
    return handleError((error as Error).message);
  }
}

export async function unlikePost(videoId: string) {
  if (!videoId) {
    return handleError("Please, make sure required data is provided!", 400);
  }

  try {
    const currentUser = await getCurrentUserInfo({ returnToUI: false });
    if ("error" in currentUser) {
      return currentUser as ServerError;
    }
    const video = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      videoId
    )) as VideoRecord;

    if (!video) {
      return handleError("No video found!", 204);
    }
    const likes = video.likes;
    const filteredList = likes.filter((item) => item !== currentUser?.$id);

    return await databases
      .updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.videosCollectionId,
        videoId,
        { likes: [...filteredList] }
      )
      .then(() => {
        return {
          dislikedPost: videoId,
          disliked: true,
        };
      });
  } catch (error) {
    return handleError((error as Error).message);
  }
}

export async function deletePost(videoId: string) {
  if (!videoId) {
    return handleError("Please, make sure required data is provided!", 400);
  }
  try {
    const userInfo = await getCurrentUserInfo({ returnToUI: false });
    if ("error" in userInfo) {
      return userInfo as ServerError;
    }
    const video = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      videoId
    )) as VideoRecordWithFileIds;
    if (userInfo.$id !== video.creator.$id) {
      return handleError("You are not allowed to perform this action!", 403);
    }
    if (video.thumbnailFileId && video.videoFileId) {
      // delete from storage
      const [deletedThumbnail, deletedVideo] = await Promise.all([
        deleteFile(video.thumbnailFileId),
        deleteFile(video.videoFileId),
      ]);
      if ("error" in deletedThumbnail) {
        return deletedThumbnail;
      }
      if ("error" in deletedVideo) {
        return deletedVideo;
      }
      return await databases
        .deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.videosCollectionId,
          videoId
        )
        .then(() => {
          return { deleted: true };
        });
    } else {
      throw new Error("Something went wrong!");
    }
  } catch (error) {
    return handleError((error as Error).message, 500);
  }
}

export async function editPost(
  videoId: string,
  updatedData: Partial<Omit<CreateVideoForm, "creator" | "video">>
) {
  if (!videoId || !updatedData) {
    return handleError("Please, make sure required data is provided!", 400);
  }
  try {
    const userInfo = await getCurrentUserInfo({ returnToUI: false });
    if ("error" in userInfo) {
      return userInfo as ServerError;
    }
    const video = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.videosCollectionId,
      videoId
    )) as VideoRecordWithFileIds;
    if (userInfo.$id !== video.creator.$id) {
      return handleError("You are not allowed to perform this action!", 403);
    }
    if (updatedData.thumbnail && video.thumbnailFileId) {
      const res = await deleteFile(video.thumbnailFileId);
      if ("error" in res) {
        return res;
      }
      const uploadedThumbnail = await uploadFile(
        updatedData.thumbnail,
        "Image"
      );
      if ("error" in uploadedThumbnail) {
        return uploadedThumbnail;
      }
      const updatedVideo = (await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.videosCollectionId,
        videoId,
        {
          thumbnail: uploadedThumbnail.url,
          thumbnailFileId: uploadedThumbnail.fileId,
        }
      )) as VideoRecordWithFileIds;

      return returnVideosToUI([updatedVideo]);
    } else {
      const updatedVideo = (await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.videosCollectionId,
        videoId,
        {
          title: updatedData.title,
        }
      )) as VideoRecordWithFileIds;
      return returnVideosToUI([updatedVideo]);
    }
  } catch (error) {
    return handleError((error as Error).message);
  }
}
