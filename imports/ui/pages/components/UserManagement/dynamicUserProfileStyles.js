import { getProfileCss } from "../../../../utils/utils";

export const dynamicUserProfileStyles = {
  card: props => getProfileCss(props)?.card,
  bodyStyle: props => getProfileCss(props)?.bodyStyle,
  mainDiv: props => getProfileCss(props)?.mainDiv,
  changePasswordDiv: props => getProfileCss(props)?.changePasswordDiv,
  errorTitle: props => getProfileCss(props)?.errorTitle,
  avatarChangeDiv: props => getProfileCss(props)?.avatarChangeDiv,
  avatar: props => getProfileCss(props)?.avatar,
  formUsernameDiv: props => getProfileCss(props)?.formUsernameDiv,
  changeUsernameDiv: props => getProfileCss(props)?.changeUsernameDiv
};
