import {
  View,
  Modal,
  Pressable,
  ScrollView,
  ModalProps,
  ScrollViewProps,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
} from "react-native";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = {
  min: 10,
  max: WINDOW_HEIGHT * 0.7,
};
const PAN_THRESHOLD = 100;

interface BottomSheetProps {
  containerStyle?: StyleProp<ViewStyle>;
  modalProps?: ModalProps;
  backdropStyle?: StyleProp<ViewStyle>;
  handleBackdropClick: () => void;
  scrollViewProps?: ScrollViewProps;
  children: React.ReactNode;
}
export interface BottomSheetRef {
  expand: () => void;
  collapse: () => void;
}
const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet(
    {
      containerStyle,
      backdropStyle,
      handleBackdropClick,
      modalProps = {},
      children,
      scrollViewProps = {},
      ...rest
    },
    ref
  ) {
    const [isExpanded, setIsExpanded] = useState(false);
    // Shared value for translationY (vertical movement)
    const translateY = useSharedValue(WINDOW_HEIGHT - DRAWER_HEIGHT.min);
    const opacity = useSharedValue(0);

    const pan = Gesture.Pan().onChange(() => console.log("started"));
    const close = () => {
      translateY.value = withSpring(WINDOW_HEIGHT - DRAWER_HEIGHT.min);
      opacity.value = withTiming(0, {
        duration: 100,
      });
      setIsExpanded(false);
    };

    const open = () => {
      setIsExpanded(true);
      translateY.value = withSpring(WINDOW_HEIGHT - DRAWER_HEIGHT.max);
      opacity.value = withTiming(0.5, {
        duration: 100,
      });
    };
    useImperativeHandle(ref, () => ({
      expand: open,
      collapse: close,
    }));
    return (
      <Modal
        animationType="none"
        onRequestClose={handleBackdropClick}
        transparent={true}
        visible={isExpanded}
        {...modalProps}
      >
        <>
          <StatusBar translucent backgroundColor="transparent" />
          {isExpanded && (
            <Animated.View style={[styles.overlay, { opacity }, backdropStyle]}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={handleBackdropClick}
              />
            </Animated.View>
          )}
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY }],
              },
              containerStyle,
            ]}
          >
            <View style={styles.handleWrapper}>
              <View style={styles.handle} />
            </View>
            <ScrollView {...scrollViewProps}>{children}</ScrollView>
          </Animated.View>
        </>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheet: {
    padding: 24,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    left: 0,
    bottom: 0,
    position: "absolute",
    width: WINDOW_WIDTH,
    height: DRAWER_HEIGHT.max,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 15.19,

    elevation: 20,
  },

  overlay: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10,
    position: "absolute",
    backgroundColor: "#000",
  },

  handle: {
    height: 8,
    width: 100,
    borderRadius: 4,
    alignSelf: "center",
    backgroundColor: "black",
  },
  handleWrapper: {
    marginTop: -24,
    paddingVertical: 24,
  },
});

export default BottomSheet;
