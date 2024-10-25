import { View, Text } from "react-native";
import React, { useRef } from "react";
import { THEME } from "@/constants/theme";
import { BottomSheet, Button } from "@/components/ui";
import { FontAwesome5 } from "@expo/vector-icons";
import { useUnFollow } from "@/hooks/useUser";
import { BottomSheetRef } from "@/components/ui/BottomSheet";
import { useGetCurrentUserInfo } from "@/hooks/useAuth";

const UserCardActionsMenu = ({ userId }: { userId: string }) => {
  const { data: user } = useGetCurrentUserInfo();
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const { mutate, isPending } = useUnFollow();

  const handleVisibility = () => {
    bottomSheetRef.current?.collapse();
  };
  const handleUnFollowing = () => {
    mutate(
      {
        userToUnFollowId: userId,
        invalidate: ["followings", user?.$id as string],
      },
      { onSettled: () => handleVisibility() }
    );
  };

  return (
    <>
      <Button
        onPress={() => bottomSheetRef.current?.expand()}
        variant={"ghost"}
        size={"icon"}
      >
        <FontAwesome5
          name="ellipsis-v"
          size={24}
          color={THEME.colors.gray["100"]}
        />
      </Button>
      <BottomSheet ref={bottomSheetRef} handleBackdropClick={handleVisibility}>
        <Button
          variant={"ghost"}
          onPress={handleUnFollowing}
          isLoading={isPending}
          className="w-full flex flex-row items-center justify-between"
        >
          <View className="flex flex-row gap-4 items-center justify-start">
            <FontAwesome5
              name="user-minus"
              size={24}
              color={THEME.colors.primary}
            />
            <Text className="text-primary font-pmedium text-lg capitalize">
              unfollow user
            </Text>
          </View>
        </Button>
      </BottomSheet>
    </>
  );
};

export default UserCardActionsMenu;
