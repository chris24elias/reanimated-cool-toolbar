import React, { PropsWithChildren } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
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
  WithTimingConfig,
} from "react-native-reanimated";

import Ionicons from "@expo/vector-icons/Ionicons";

export type IRootProps = {};

const TOOLS = [
  {
    id: 1,
    icon: "pencil",
    color: "#1abc9c",
    name: "draw",
  },
  {
    id: 2,
    icon: "brush",
    color: "#9b59b6",
    name: "lasso",
  },
  {
    id: 3,
    icon: "ios-chatbox-ellipses-outline",
    color: "#e74c3c",
    name: "comment",
  },
  {
    id: 4,
    icon: "color-wand",
    color: "#f1c40f",
    name: "picker",
  },
  {
    id: 5,
    icon: "arrow-undo",
    color: "#6c5ce7",
    name: "rotate",
  },
  {
    id: 6,
    icon: "",
    color: "#d63031",
  },
  {
    id: 7,
    icon: "",
    color: "#81ecec",
  },
  {
    id: 8,
    icon: "",
    color: "#55efc4",
  },
  {
    id: 9,
    icon: "",
  },
  {
    id: 10,
    icon: "",
  },
  {
    id: 11,
    icon: "",
  },
  {
    id: 12,
    icon: "",
  },
  {
    id: 13,
    icon: "",
  },
  {
    id: 14,
    icon: "",
  },
  {
    id: 15,
    icon: "",
  },
  {
    id: 16,
    icon: "",
  },
  {
    id: 17,
    icon: "",
  },
  {
    id: 18,
    icon: "",
  },
];
const BOX_SIZE_RAW = 50;
const MARGIN = 5;
const BOX_SIZE = BOX_SIZE_RAW + MARGIN * 2;
const TOP_OFFSET = 80;
const MAX = BOX_SIZE * TOOLS.length + 80;

// const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          height: "50%",
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
        }}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={{
            zIndex: 10,
            width: "100%",
            height: "50%",
            top: TOP_OFFSET,
            left: 20,
            overflow: "hidden",
            paddingLeft: 20,
          }}
        >
          <Animated.View
            style={{
              backgroundColor: "white",
              width: 64,
              borderRadius: 12,
            }}
          >
            <Animated.ScrollView
              style={{
                overflow: "visible",
              }}
              contentContainerStyle={{
                // alignItems: "center",
                paddingBottom: MARGIN * 2,
              }}
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
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const Tool = ({ index, y, longPressing, pointerY, t }) => {
  const { height } = useWindowDimensions();
  const boxWidth = useSharedValue(BOX_SIZE_RAW);
  const left = useSharedValue(0);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const springConfig: WithSpringConfig = {
    damping: 15,
    mass: 0.6,
    stiffness: 120,
  };

  const scaleUp = () => {
    "worklet";
    boxWidth.value = withSpring(BOX_SIZE * 2.5, springConfig);
    left.value = withSpring(85, springConfig);
    scale.value = withSpring(1.25, springConfig);
    shadowOpacity.value = withTiming(0.4);
    textOpacity.value = withTiming(1);
  };

  const scaleDown = () => {
    "worklet";
    boxWidth.value = withSpring(BOX_SIZE_RAW, springConfig);
    left.value = withSpring(0, springConfig);
    scale.value = withSpring(1, springConfig);
    shadowOpacity.value = withTiming(0);
    textOpacity.value = withTiming(0);
  };

  useAnimatedReaction(
    () => {
      const position = index * BOX_SIZE - y.value;
      const py = pointerY.value - 20;
      if (py >= position && py <= position + BOX_SIZE && longPressing.value) {
        return 1;
      } else {
        return 0;
      }
    },
    (result) => {
      //
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
      const h = height / 2 - 20;
      const paddingTop = 0;
      const isDisappearing = -BOX_SIZE - paddingTop;
      const isTop = 0 - paddingTop;
      const isBottom = h - BOX_SIZE - paddingTop;
      const isAppearing = h - paddingTop;
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
        scale.value = 0.4;
      }

      if (result === 1) {
        scale.value = 0.4;
      }
    }
  ),
    [y];

  const style = useAnimatedStyle(() => {
    const max = 658;
    const ty = interpolate(y.value, [-100, 0, max], [7 * index, 10, 10]);

    return {
      height: BOX_SIZE_RAW,
      width: boxWidth.value,
      //   left: left.value,
      backgroundColor: t.color || "red",
      borderRadius: 12,
      zIndex: 100,
      //   marginLeft: 7,
      alignSelf: "center",
      marginVertical: MARGIN,
      transform: [
        { scale: scale.value },
        { translateY: ty },
        { translateX: left.value },
      ],
      shadowColor: "#000000",
      shadowOffset: {
        height: 2,
        width: 0,
      },
      shadowOpacity: shadowOpacity.value,
      shadowRadius: 4,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      position: "absolute",
      left: 13 + 25 + 10,
    };
  });

  return (
    <Animated.View style={style}>
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          //   justifyContent: "center",
          alignItems: "center",
          paddingLeft: 13,
        }}
      >
        <Ionicons color="white" name={t.icon || "code"} size={24} />
        <Animated.View style={textStyle}>
          <Text style={{ color: "white", fontSize: 20 }}>{t.name || ""}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export { Root };
