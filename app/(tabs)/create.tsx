import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "@/components/ui/FormField";
import { ResizeMode, Video } from "expo-av";
import { getDocumentAsync } from "expo-document-picker";
import Button, { ButtonText } from "@/components/ui/Button";
import { CreateVideoForm } from "@/types/video";
import { showToastWithStatus } from "@/utils/alert";
import { router } from "expo-router";
import { AFTER_CREATION_ROUTE } from "@/constants/routes";
import ProgressBar from "@/components/ui/ProgressBar";
import { FontAwesome5 } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";
import { useCreatePost } from "@/hooks/useVideo";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const Create = () => {
  const videoRef = useRef<Video>(null);
  const scrollViewRef = useRef<null | ScrollView>(null);
  const { data: user } = useGetCurrentUserInfo();
  const { mutate, reset, isError, error, isPending } = useCreatePost();
  const [form, setForm] = useState<CreateVideoForm>({
    title: "",
    thumbnail: null,
    video: null,
    creator: (user?.$id as string) ?? "",
  });

  const openFilePicker = async (mediaType: "video" | "image") => {
    const pickedFiles = await getDocumentAsync({
      type:
        mediaType === "video"
          ? ["video/mp4", "video/gif"]
          : ["image/png", "image/jpg", "image/jpeg"],
    });
    if (pickedFiles.canceled === false) {
      switch (mediaType) {
        case "image":
          setForm({
            ...form,
            thumbnail: pickedFiles.assets[0],
          });
          break;
        case "video":
          setForm({
            ...form,
            video: pickedFiles.assets[0],
          });
          break;
        default:
          console.error("media type is not supported!");
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.thumbnail || !form.video) {
      return showToastWithStatus(
        "Please, make sure all fields are filled!",
        400
      );
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    mutate(form, {
      onSuccess: () => {
        router.push(AFTER_CREATION_ROUTE);
        setForm({
          title: "",
          video: null,
          thumbnail: null,
          creator: "",
        });
        reset();
      },
    });
  };

  const handleVideoClick = async () => {
    const status = await videoRef.current?.getStatusAsync();
    if (!form.video) {
      await openFilePicker("video");
    } else {
      if (status?.isLoaded) {
        if (status.isPlaying) {
          await videoRef.current?.pauseAsync();
        } else {
          await videoRef.current?.playAsync();
        }
      }
    }
  };
  return (
    <SafeAreaView className="bg-background h-full relative">
      <ScrollView ref={scrollViewRef} className="px-4 my-6">
        <View className="flex flex-1 gap-2">
          <Text className="text-2xl text-white font-psemibold">
            {isPending ? "Uploading video..." : "Upload video"}
          </Text>
          <View className="relative flex flex-1">
            <ProgressBar isLoading={isPending} />
          </View>
        </View>

        {isError && (
          <View className="mt-2 flex border border-danger p-2 rounded-xl">
            <Text className="text-danger font-psemibold capitalize">
              {error.name}
            </Text>
            <Text className="text-white font-pregular text-base mt-2">
              {error.message}
            </Text>
          </View>
        )}
        <FormField
          title="Video Title"
          value={form.title}
          placeholder="Give your video a catchy title..."
          onChangeText={(e) => setForm({ ...form, title: e })}
          containerStyle="mt-10"
        />

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Video
          </Text>

          <TouchableOpacity onPress={handleVideoClick}>
            {form.video ? (
              <Video
                ref={videoRef}
                source={{ uri: form.video.uri }}
                className="w-full h-64 rounded-2xl"
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
                <FontAwesome5
                  name="cloud-upload-alt"
                  size={24}
                  color={THEME.colors.brown["100"]}
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose a video
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Thumbnail Image
          </Text>

          <TouchableOpacity onPress={() => openFilePicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
                <FontAwesome5
                  name="cloud-upload-alt"
                  size={24}
                  color={THEME.colors.brown["100"]}
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose an image
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Button onPress={handleSubmit} className="mt-7" isLoading={isPending}>
          <ButtonText>Submit & publish</ButtonText>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
