import { View, TextInput } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { FILTER_OPTIONS } from "@/constants/app";
import { FontAwesome5 } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";
import Button from "./Button";

const SearchInput = ({ initialQuery }: { initialQuery?: string }) => {
  const pathname = usePathname();
  const { rest } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const getFilter = () => {
    const filter = pathname.includes("favourites")
      ? FILTER_OPTIONS.FavouritesOnly
      : pathname.includes("created")
      ? FILTER_OPTIONS.CreatedOnly
      : FILTER_OPTIONS.EveryThing;
    return filter;
  };
  const handlePressing = () => {
    if (pathname.startsWith("/search")) {
      // updating the query parameter in the search route
      // will trigger refetch request
      router.setParams({ rest: [searchQuery, rest[1]] });
    } else {
      const filter = getFilter();
      router.push(`/search/${searchQuery}/${filter}`);
    }
  };
  return (
    <View className="flex flex-row items-center space-x-4 w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={searchQuery}
        placeholder="Search a video topic"
        placeholderTextColor="#CDCDE0"
        onChangeText={(e: string) => setSearchQuery(e)}
      />

      <Button
        variant={"ghost"}
        size={"icon"}
        onPress={handlePressing}
        disabled={!Boolean(searchQuery)}
      >
        <FontAwesome5
          name="search"
          size={24}
          color={THEME.colors.gray["100"]}
        />
      </Button>
    </View>
  );
};

export default SearchInput;
