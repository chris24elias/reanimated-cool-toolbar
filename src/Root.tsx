import React, { PropsWithChildren } from "react";
import { View, Text } from "react-native";

export type IRootProps = {};

const TOOLS = [
  {
    id: 1,
    icon: "",
  },
  {
    id: 2,
    icon: "",
  },
  {
    id: 3,
    icon: "",
  },
  {
    id: 4,
    icon: "",
  },
  {
    id: 5,
    icon: "",
  },
  {
    id: 6,
    icon: "",
  },
  {
    id: 7,
    icon: "",
  },
  {
    id: 8,
    icon: "",
  },
  {
    id: 9,
    icon: "",
  },
  {
    id: 10,
    icon: "",
  },
];

const Root = ({}: PropsWithChildren<IRootProps>) => {
  return (
    <View className="flex-1  bg-white">
      <View className="gap-2">
        {TOOLS.map((t) => {
          return (
            <View className=" h-12 w-12 items-center justify-center bg-red-500 p-2">
              <Text>icon</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export { Root };
