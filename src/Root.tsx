import React, { PropsWithChildren } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  withTiming,
} from "react-native-reanimated";

import Ionicons from "@expo/vector-icons/Ionicons";
import { TOOLS } from "./utils";

export type IRootProps = {};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const TOOLBAR_HEIGHT = SCREEN_HEIGHT * 0.52;
const BOX_SIZE_RAW = 50;
const MARGIN = 5;
const BOX_SIZE = BOX_SIZE_RAW + MARGIN * 2;
const TOP_OFFSET = 80;
const TOOL_PADDING_LEFT = 13;
const TOOL_ICON_SIZE = 25;
const SCROLLVIEW_PADDING_BOTTOM = 20;

const Root = ({}: PropsWithChildren<IRootProps>) => {
  const y = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    y.value = event.contentOffset.y;
  });
  const longPressing = useSharedValue(false);
  const pointerY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      pointerY.value = e.y;
    })
    .onChange((e) => {
      pointerY.value = e.y;
    })
    .onEnd((e) => {
      pointerY.value = -100;
      longPressing.value = false;
    })
    .onFinalize((e) => {
      pointerY.value = -100;
      longPressing.value = false;
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart((e) => {
      longPressing.value = true;
    });

  const gesture = Gesture.Simultaneous(panGesture, longPressGesture);

  return (
    <View style={styles.container}>
      <View style={styles.shadowContainer} />
      <Animated.View style={styles.toolbarContainer}>
        <GestureDetector gesture={gesture}>
          <Animated.ScrollView
            style={styles.scrollviewContainer}
            contentContainerStyle={styles.scrollviewContentContainer}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={scrollHandler}
          >
            {TOOLS.map((t, index) => {
              return (
                <Tool
                  key={`tool_${t.id}`}
                  index={index}
                  y={y}
                  longPressing={longPressing}
                  pointerY={pointerY}
                  t={t}
                />
              );
            })}
          </Animated.ScrollView>
        </GestureDetector>
      </Animated.View>
    </View>
  );
};

const Tool = ({ index, y, longPressing, pointerY, t }) => {
  const boxWidth = useSharedValue(BOX_SIZE_RAW);
  const left = useSharedValue(0);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const scaleUp = () => {
    "worklet";
    const springConfig: WithSpringConfig = {
      damping: 15,
      mass: 0.6,
      stiffness: 120,
    };

    boxWidth.value = withSpring(
      BOX_SIZE + MARGIN + t.name.length * 12,
      springConfig
    );
    left.value = withSpring(85, springConfig);
    scale.value = withSpring(1.25, springConfig);
    shadowOpacity.value = withTiming(0.4);
    textOpacity.value = withTiming(1);
  };

  const scaleDown = () => {
    "worklet";
    const springConfig: WithSpringConfig = {
      damping: 15,
      mass: 1.2,
      stiffness: 100,
    };
    boxWidth.value = withSpring(BOX_SIZE_RAW, springConfig);
    left.value = withSpring(0, springConfig);
    scale.value = withSpring(1, springConfig);
    shadowOpacity.value = withTiming(0);
    textOpacity.value = withTiming(0);
  };

  useAnimatedReaction(
    () => {
      const position = index * BOX_SIZE - y.value;
      const py = pointerY.value;
      if (py >= position && py <= position + BOX_SIZE && longPressing.value) {
        return 1;
      } else {
        return 0;
      }
    },
    (result) => {
      if (result) {
        scaleUp();
      } else {
        scaleDown();
      }
    }
  ),
    [y, longPressing];

  useAnimatedReaction(
    () => {
      const h = TOOLBAR_HEIGHT - 10;
      const isDisappearing = -BOX_SIZE;
      const isTop = 0;
      const isBottom = h - BOX_SIZE;
      const isAppearing = h;
      const position = index * BOX_SIZE - y.value;

      const p = interpolate(
        position,
        [isDisappearing, isTop, isBottom, isAppearing],
        [-1, 0, 0, 1],
        Extrapolate.CLAMP
      );
      return p;
    },
    (result) => {
      if (Math.abs(result) >= 0.7 && Math.abs(result) <= 1) {
        scale.value = withSpring(1);
      }

      if (result === -1) {
        scale.value = 0.3;
      }

      if (result === 1) {
        scale.value = 0.3;
      }
    }
  ),
    [y];

  const style = useAnimatedStyle(() => {
    const max =
      BOX_SIZE * TOOLS.length - TOOLBAR_HEIGHT + SCROLLVIEW_PADDING_BOTTOM;
    const ty = interpolate(
      y.value,
      [-50, 0, max, max + 100],
      [7 * index, 10, 10, -4 * index]
    );

    return {
      width: boxWidth.value,
      transform: [
        { scale: scale.value },
        { translateY: ty },
        { translateX: left.value },
      ],
      shadowOpacity: shadowOpacity.value,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      position: "absolute",
      left: TOOL_PADDING_LEFT + TOOL_ICON_SIZE + 10,
    };
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: t.color || "red",
        },
        styles.toolContainer,
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          alignItems: "center",
          paddingLeft: TOOL_PADDING_LEFT,
        }}
      >
        <Ionicons color="white" name={t.icon || "code"} size={TOOL_ICON_SIZE} />
        <Animated.View style={textStyle}>
          <Text style={styles.toolText}>{t.name || ""}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export { Root };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  shadowContainer: {
    height: TOOLBAR_HEIGHT,
    width: 64,
    position: "absolute",
    zIndex: -1,
    backgroundColor: "white",
    shadowColor: "#000000",
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    top: TOP_OFFSET,
    left: 40,
    borderRadius: 12,
  },
  toolbarContainer: {
    zIndex: 10,
    width: "100%",
    height: TOOLBAR_HEIGHT,
    top: TOP_OFFSET,
    left: 20,
    overflow: "hidden",
    paddingLeft: 20,
  },
  scrollviewContainer: {
    overflow: "visible",
    backgroundColor: "white",
    width: 64,
    borderRadius: 12,
  },
  scrollviewContentContainer: {
    paddingBottom: SCROLLVIEW_PADDING_BOTTOM,
  },
  toolText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  toolContainer: {
    height: BOX_SIZE_RAW,
    marginVertical: MARGIN,
    borderRadius: 12,
    zIndex: 100,
    alignSelf: "center",
    shadowColor: "#000000",
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowRadius: 4,
  },
});
