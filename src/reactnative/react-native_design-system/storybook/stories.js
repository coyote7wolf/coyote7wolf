import React from "react";
import { storiesOf } from "@storybook/react-native";
import { Button } from "../../src/components/Button";
import { View } from "react-native";

storiesOf("Button", module).add("default", () => (
  <View style={{ padding: 20 }}>
    <Button title="Hello Storybook" />
  </View>
));
