import {
  createVideo,
  deletePost,
  getAllFavourites,
  getAllVideos,
  getRecentVideos,
  getUserVideos,
  likePost,
  searchPosts,
  unlikePost,
} from "@/lib/video";
import { FilterOptions, FilterOptionsWithUserId } from "@/types/config";
import {
  CreateVideoForm,
  VideoDocWithStates,
  PaginatedVideoRecordsListWithStates,
  VideoRecordsListWithStates,
} from "@/types/video";
import { showToastWithStatus } from "@/utils/alert";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useGetCurrentUserInfo } from "./useAuth";
import { handleErorrUI } from "@/utils/error";

export const useFetchAllVideos = (): UseInfiniteQueryResult<
  InfiniteData<PaginatedVideoRecordsListWithStates, string | undefined>,
  Error
> => {
  return useInfiniteQuery({
    queryKey: ["allVideos"],
    queryFn: async ({ pageParam }) => {
      const res = await getAllVideos(pageParam);
      if ("error" in res) {
        throw new Error(res.message);
      } else {
        return res as PaginatedVideoRecordsListWithStates;
      }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: PaginatedVideoRecordsListWithStates) =>
      lastPage.cursor,
    maxPages: 5,
  });
};

export const useFetchRecentVideos = () => {
  return useQuery({
    queryKey: ["recentVideos"],
    queryFn: async () => {
      const res = await getRecentVideos();
      if ("error" in res) {
        throw new Error(res.message);
      } else {
        return res as VideoRecordsListWithStates;
      }
    },
  });
};

export const useFetchUserVideos = (
  user: string
): UseInfiniteQueryResult<
  InfiniteData<PaginatedVideoRecordsListWithStates, string | undefined>,
  Error
> => {
  return useInfiniteQuery({
    queryKey: ["userVideos", user],
    queryFn: async ({ pageParam }) => {
      const res = await getUserVideos(user, pageParam);
      if ("error" in res) {
        throw new Error(res.message);
      } else {
        return res as PaginatedVideoRecordsListWithStates;
      }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: PaginatedVideoRecordsListWithStates) =>
      lastPage.cursor,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
};

export const useFetchUserFavourites = (
  user: string
): UseInfiniteQueryResult<
  InfiniteData<PaginatedVideoRecordsListWithStates, string | undefined>,
  Error
> => {
  return useInfiniteQuery({
    queryKey: ["userFavouritesList", user],
    queryFn: async ({ pageParam }) => {
      const res = await getAllFavourites(user, pageParam);
      if ("error" in res) {
        throw new Error(res.message);
      } else {
        return res;
      }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: PaginatedVideoRecordsListWithStates) =>
      lastPage.cursor,
  });
};

export const useSearch = <T extends FilterOptions>(
  query: string,
  filterOptionsWithUserId?: FilterOptionsWithUserId<T>
): UseInfiniteQueryResult<
  InfiniteData<PaginatedVideoRecordsListWithStates, string | undefined>,
  Error
> => {
  return useInfiniteQuery({
    queryKey: ["searchPosts", query],
    queryFn: async ({ pageParam }) => {
      const res = await searchPosts(query, pageParam, filterOptionsWithUserId);
      if ("error" in res) {
        throw new Error(res.message);
      } else {
        return res as PaginatedVideoRecordsListWithStates;
      }
    },
    enabled: !!query,
    initialPageParam: undefined,
    getNextPageParam: (lastPage: PaginatedVideoRecordsListWithStates) =>
      lastPage.cursor,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreatePost = () => {
  return useMutation({
    mutationFn: async (data: CreateVideoForm) => {
      const res = await createVideo(data);
      if ("error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus(
          "🥳 Post has been created and published successfully! 🥳",
          201
        );
        return res as VideoDocWithStates;
      }
    },
  });
};

export const useLikeVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
    }: {
      postId: string;
      invalidate: string[];
    }) => {
      const res = await likePost(postId);
      if ("error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus("😊 Liked! 😊", 200);
        return res;
      }
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: variables.invalidate });

      // Snapshot the previous value
      const previous = queryClient.getQueryData(variables.invalidate);

      // Optimistically update to the new value
      queryClient.setQueryData(
        variables.invalidate,
        (
          old: InfiniteData<
            PaginatedVideoRecordsListWithStates,
            string | undefined
          >
        ) => {
          const allVideos = old.pages.map((group) => group.documents).flat();
          const video = allVideos.find(
            (video) => video.$id === variables.postId
          );

          if (video) {
            // override the array
            video.likesCount++;
            video.isLikedPost = !video.isLikedPost;
          }
          return old;
        }
      );

      // Return a context object with the snapshotted value
      return { previous };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      queryClient.setQueryData(variables.invalidate, context?.previous);
    },
  });
};

export const useUnLikeVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
    }: {
      postId: string;
      invalidate: string[];
    }) => {
      const res = await unlikePost(postId);
      if ("error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus("😊 Disliked! 😊", 200);
        return res;
      }
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: variables.invalidate });
      const previous = queryClient.getQueryData(variables.invalidate);
      queryClient.setQueryData(
        variables.invalidate,
        (
          old: InfiniteData<
            PaginatedVideoRecordsListWithStates,
            string | undefined
          >
        ) => {
          const allVideos = old.pages.map((group) => group.documents).flat();
          const video = allVideos.find(
            (video) => video.$id === variables.postId
          );
          if (video) {
            video.likesCount--;
            video.isLikedPost = !video.isLikedPost;
          }
          return old;
        }
      );
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(variables.invalidate, context?.previous);
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();
  const { data: user } = useGetCurrentUserInfo();
  const cacheKey = ["userVideos", user?.$id as string];
  return useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      const res = await deletePost(postId);
      if ("error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus("🥳 Post has been deleted successfully! 🥳", 200);
        return res;
      }
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: cacheKey,
      });
      const previous = queryClient.getQueryData(cacheKey);
      queryClient.setQueryData(
        cacheKey,
        (
          old: InfiniteData<
            PaginatedVideoRecordsListWithStates,
            string | undefined
          >
        ) => {
          const updatedPages = old.pages.map((group) => {
            // Filter out the video that matches the id
            let video = group.documents.find(
              (video) => video.$id === variables.postId
            );
            if (video) {
              return {
                ...group,
                documents: group.documents.filter(
                  (video) => video.$id !== variables.postId
                ),
              };
            }
            return { ...group };
          });
          return {
            ...old,
            pages: updatedPages,
          };
        }
      );
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(cacheKey, context?.previous);
    },
  });
};
