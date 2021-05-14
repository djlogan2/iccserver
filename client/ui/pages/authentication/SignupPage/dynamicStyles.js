import { get } from "lodash";

export const dynamicStyles = {
  modalShow: (props) => {
    const css = get(props, "css.signupPageCss", {});
    return css.modalShow;
  },
  modalDialog: (props) => {
    const css = get(props, "css.signupPageCss", {});
    return css.modalDialog;
  },
  modalContent: (props) => {
    const css = get(props, "css.signupPageCss", {});
    return css.modalContent;
  },
  modalHeader: (props) => {
    const css = get(props, "css.signupPageCss", {});
    return css.modalHeader;
  },
  modalBody: (props) => {
    const css = get(props, "css.signupPageCss", {});
    return css.modalBody;
  },
  modalFooter: (props) => {
    const css = get(props, "css.signupPageCss", {});
    return css.modalFooter;
  },
  textCenter: (props) => {
    const css = get(props, "css.signupPageCss", {});
    return css.textCenter;
  },
  centerBlock: (props) => {
    const css = get(props, "css.signupPageCss", {});
    return css.centerBlock;
  },
  formGroup: (props) => {
    const css = get(props, "css.signupPageCss", {});
    return css.formGroup;
  },
};
