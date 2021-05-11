import { get } from "lodash";

export const dynamicStyles = {
  modalShow: (props) => {
    const css = get(props, "css.loginPageCss", {});
    return css.modalShow;
  },
  modalDialog: (props) => {
    const css = get(props, "css.loginPageCss", {});
    return css.modalDialog;
  },
  modalContent: (props) => {
    const css = get(props, "css.loginPageCss", {});
    return css.modalContent;
  },
  modalHeader: (props) => {
    const css = get(props, "css.loginPageCss", {});
    return css.modalHeader;
  },
  modalBody: (props) => {
    const css = get(props, "css.loginPageCss", {});
    return css.modalBody;
  },
  modalFooter: (props) => {
    const css = get(props, "css.loginPageCss", {});
    console.log(css.modalFooter);
    return css.modalFooter;
  },
  textCenter: (props) => {
    const css = get(props, "css.loginPageCss", {});
    return css.textCenter;
  },
  centerBlock: (props) => {
    const css = get(props, "css.loginPageCss", {});
    return css.centerBlock;
  },
  formGroup: (props) => {
    const css = get(props, "css.loginPageCss", {});
    return css.formGroup;
  },
};
