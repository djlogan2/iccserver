import { get } from "lodash";

export const dynamicStyles = {
  container: (props) => {
    const css = get(props, "css.gameControlBlockCss", {});
    return css.container;
  },
  actionControlsItem: (props) => {
    const css = get(props, "css.gameControlBlockCss", {});
    return css.actionControlsItem;
  },
  locationControlsItemImage: (props) => {
    const css = get(props, "css.gameControlBlockCss", {});
    return css.locationControlsItemImage;
  },
  locationControlItem: (props) => {
    const css = get(props, "css.gameControlBlockCss", {});
    return css.locationControlItem;
  },
  locationControls: (props) => {
    const css = get(props, "css.gameControlBlockCss", {});
    return css.locationControls;
  },
  actionControls: (props) => {
    const css = get(props, "css.gameControlBlockCss", {});
    return css.actionControls;
  },
};
