import { get } from "lodash";

export const dynamicUserProfileStyles = {
  card: props => {
    const css = get(props, "css.profileCss", {});
    return css.card;
  },
  bodyStyle: props => {
    const css = get(props, "css.profileCss", {});
    return css.bodyStyle;
  },
  mainDiv: props => {
    const css = get(props, "css.profileCss", {});
    return css.mainDiv;
  },
  changePasswordDiv: props => {
    const css = get(props, "css.profileCss", {});
    return css.changePasswordDiv;
  },
  errorTitle: props => {
    const css = get(props, "css.profileCss", {});
    return css.errorTitle;
  },
  avatarChangeDiv: props => {
    const css = get(props, "css.profileCss", {});
    return css.avatarChangeDiv;
  },
  avatar: props => {
    const css = get(props, "css.profileCss", {});
    return css.avatar;
  },
  formUsernameDiv: props => {
    const css = get(props, "css.profileCss", {});
    return css.formUsernameDiv;
  },
  changeUsernameDiv: props => {
    const css = get(props, "css.profileCss", {});
    return css.changeUsernameDiv;
  }
};
