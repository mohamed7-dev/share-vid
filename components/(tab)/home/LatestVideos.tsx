import {
  FlatList,
  ViewToken,
  TouchableOpacity,
  ImageBackground,
  Image,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { VideoDocWithStates } from "@/types/video";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { mergeClasses } from "@/utils/twMerge";
import { ProcessStatus } from "@/components/generic";
import { router } from "expo-router";
import IMAGES from "@/constants/images";
import { Loader } from "@/components/ui";
import { FontAwesome5 } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";

function PostItem({
  item,
  index,
  isActive,
  isFetching,
}: {
  item: VideoDocWithStates;
  index: number;
  isActive: boolean;
  isFetching: boolean;
}) {
  const [play, setPlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<Video>(null);
  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isActive ? 1.1 : 0.9, {
      mass: 1,
      damping: 10,
      stiffness: 100,
    });
    const opacity = withSpring(isActive ? 1 : 0.5, {
      mass: 1,
      damping: 10,
      stiffness: 100,
    });

    return {
      transform: [{ scale }],
      opacity,
    };
  });
  useEffect(() => {
    const handlePlaying = async () => {
      if (videoRef.current) {
        if (isActive) {
          await videoRef.current.playAsync();
        } else {
          await videoRef.current.pauseAsync();
        }
      }
    };
    handlePlaying();
  }, [isActive]);
  const handlStartLoading = () => {
    setIsLoading(true);
  };
  const handleLoading = (status: AVPlaybackStatus) => {
    if (status?.isLoaded) {
      setIsLoading(false);
    }
  };
  const handlePlayback = (status: AVPlaybackStatus) => {
    if (status?.isLoaded && status.didJustFinish) {
      setPlay(false);
    }
  };
  return (
    <Animated.View
      className={mergeClasses(
        "h-80 mr-5 relative",
        index === 0 && "ml-3",
        isFetching && "opacity-50"
      )}
      style={[animatedStyle]}
    >
      {isLoading && (
        <View className="absolute top-[45%] left-[45%]">
          <Loader />
        </View>
      )}
      {play ? (
        <Video
          source={{ uri: item.video }}
          ref={videoRef}
          useNativeControls={!isLoading}
          className="w-52 h-72 rounded-2xl mt-3 bg-white/10"
          resizeMode={ResizeMode.STRETCH}
          shouldPlay={!isLoading}
          onLoadStart={handlStartLoading}
          onLoad={handleLoading}
          onPlaybackStatusUpdate={handlePlayback}
        />
      ) : (
        <TouchableOpacity
          className="relative flex justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <ImageBackground
            source={{
              uri: item.poster,
            }}
            className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />

          <View className="absolute top-[44%] left-[40%] bg-white/20 rounded-full">
            <FontAwesome5
              name="play-circle"
              size={50}
              color={THEME.colors.gray["100"]}
            />
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
const LatestVideos = ({
  items,
  isFetching,
  isPending,
}: {
  items: VideoDocWithStates[];
  isFetching: boolean;
  isPending: boolean;
}) => {
  const [activeItemKey, setActiveItem] = useState(items ? items?.[0]?.$id : "");

  const handleItemChange = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<VideoDocWithStates>[];
  }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <FlatList
      horizontal
      data={items || []}
      keyExtractor={(item) => item.$id}
      renderItem={({ item, index }) => (
        <PostItem
          item={item}
          index={index}
          isActive={item.$id === activeItemKey}
          isFetching={isFetching}
        />
      )}
      onViewableItemsChanged={handleItemChange}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170, y: 0 }}
      ListEmptyComponent={() => (
        <ProcessStatus
          title="No Recent Videos Found!"
          subtitle="No videos created yet"
          button={{
            title: "Be the first video creator",
            handlePressing: () => router.push("/create"),
          }}
        >
          <Image
            source={IMAGES.empty}
            resizeMode="contain"
            className="w-full h-full"
          />
        </ProcessStatus>
      )}
    />
  );
};

export default LatestVideos;
