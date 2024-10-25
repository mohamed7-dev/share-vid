export type AllowedMedia = "Image" | "Video";
export type ServerError = {
  message: string;
  status: number;
  error: boolean;
};

export type FilterOptions = {
  searchFavouritesOnly?: boolean;
  searchCreatedOnly?: boolean;
};

export type FilterOptionsWithUserId<T extends FilterOptions> = T extends
  | { searchFavouritesOnly: true }
  | { searchCreatedOnly: true }
  ? T & { userId: string }
  : T & { userId?: string };
