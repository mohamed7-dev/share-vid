import {
  addToFavourites,
  followUser,
  getFollowingList,
  getProfileStats,
  removeFromFavourites,
  unfollowUser,
} from "@/lib/user";
import { FollowingListWithRecentPosts } from "@/types/user";
import { PaginatedVideoRecordsListWithStates } from "@/types/video";
import { showToastWithStatus } from "@/utils/alert";
import { handleErorrUI } from "@/utils/error";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useFetchUserFollowings = (
  user: string
): UseInfiniteQueryResult<
  InfiniteData<FollowingListWithRecentPosts, number>,
  Error
> => {
  return useInfiniteQuery({
    queryKey: ["followings", user],
    queryFn: async ({ pageParam }) => {
      const res = await getFollowingList(user, pageParam);
      if ("error" in res) {
        throw new Error(res.message);
      } else {
        return res as FollowingListWithRecentPosts;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: FollowingListWithRecentPosts) =>
      lastPage.nextPage,
    refetchOnWindowFocus: true,
  });
};

export const useFollow = () => {
  return useMutation({
    mutationFn: async ({
      userToFollowId,
    }: {
      userToFollowId: string;
      invalidate: string[];
    }) => {
      const res = await followUser(userToFollowId);
      if ("error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus(
          "🥳 Successfully added to the users you follow! 🥳",
          200
        );
        return res;
      }
    },
  });
};

export const useUnFollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userToUnFollowId,
    }: {
      userToUnFollowId: string;
      invalidate: string[];
    }) => {
      const res = await unfollowUser(userToUnFollowId);
      if ("error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus(
          "🥳 Successfully removed from users you follow! 🥳",
          200
        );
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
            FollowingListWithRecentPosts | PaginatedVideoRecordsListWithStates,
            string | undefined
          >
        ) => {
          if (variables.invalidate.includes("followings")) {
            const updatedPages = old.pages.map((group) => {
              if ("data" in group) {
                let userCard = group.data.find(
                  (user) => user?.userInfo?.$id === variables.userToUnFollowId
                );
                if (userCard) {
                  return {
                    ...group,
                    data: group.data.filter(
                      (user) =>
                        user?.userInfo?.$id !== variables.userToUnFollowId
                    ),
                  };
                }
                return { ...group };
              }
            });
            return {
              ...old,
              pages: updatedPages,
            };
          }
        }
      );
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(variables.invalidate, context?.previous);
    },
  });
};

export const useAddToFavourites = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postToAdd,
    }: {
      postToAdd: string;
      invalidate: string[];
    }) => {
      const res = await addToFavourites(postToAdd);
      if ("error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus(
          "🥳 Successfully added to your favourite videos! 🥳",
          200
        );
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
            (video) => video.$id === variables.postToAdd
          );
          if (video) {
            video.isAddedToFavourites = !video.isAddedToFavourites;
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

export const useRemoveFavourites = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postToRemove,
    }: {
      postToRemove: string;
      invalidate: string[];
    }) => {
      const res = await removeFromFavourites(postToRemove);
      if ("error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus(
          "🥳 Successfully removed from your favourite videos! 🥳",
          200
        );
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
          const updatedPages = old.pages.map((group) => {
            // Filter out the video that matches the id
            let video = group.documents.find(
              (video) => video.$id === variables.postToRemove
            );
            if (video) {
              video.isAddedToFavourites = !video.isAddedToFavourites;
              if (variables.invalidate.includes("userFavouritesList")) {
                return {
                  ...group,
                  documents: group.documents.filter(
                    (video) => video.$id !== variables.postToRemove
                  ),
                };
              }
              return { ...group };
            }
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
      queryClient.setQueryData(variables.invalidate, context?.previous);
    },
  });
};

export const useProfileStats = (userId: string) => {
  return useQuery({
    queryKey: ["profileStats", userId],
    queryFn: async () => {
      const res = await getProfileStats(userId);
      if ("error" in res) {
        showToastWithStatus(res.message, res.status);
        throw new Error(res.message);
      } else {
        return res;
      }
    },
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
};
