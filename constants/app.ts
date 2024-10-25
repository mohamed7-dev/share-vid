import { QueryClient } from "@tanstack/react-query";

export const APP_NAME = "Aora";

// react query client
export const QUERY_CLIENT = new QueryClient();

// appwrite config
export const APPWRITE_CONFIG = {
  projectId: "66ff11ef002885960717",
  platform: "com.mo_dev.ai-share",
  endPoint: "https://cloud.appwrite.io/v1",
  databaseId: "66ff14080007e5c02f74",
  videosCollectionId: "66ff146b003453f6b65d",
  usersCollectionId: "66ff14890033a399a630",
  storageId: "66ff16ff0039dc60669e",
};

// Viewability Config of FlatList
export const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 30,
};

// filter options
export enum FILTER_OPTIONS {
  EveryThing = "EveryThing",
  FavouritesOnly = "FavouritesOnly",
  CreatedOnly = "CreatedOnly",
}
