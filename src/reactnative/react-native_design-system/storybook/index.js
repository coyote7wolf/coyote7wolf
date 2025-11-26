import { getStorybookUI, configure } from "@storybook/react-native";
import { AppRegistry } from "react-native";
import { name as appName } from "../app.json";

// Import stories
configure(() => {
  require("./stories");
}, module);

const StorybookUIRoot = getStorybookUI({});

AppRegistry.registerComponent(appName, () => StorybookUIRoot);

export default StorybookUIRoot;
