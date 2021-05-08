export const getUserManagementCss = (props) => props?.css?.userManagementCss;

export const dynamicUserManagementStyles = {
  listMainDiv: (props) => getUserManagementCss(props)?.listMainDiv,
  listTable: (props) => getUserManagementCss(props)?.listTable,
  editMainDiv: (props) => getUserManagementCss(props)?.editMainDiv,
  editCard: (props) => getUserManagementCss(props)?.editCard,
  editMainCardDiv: (props) => getUserManagementCss(props)?.editMainCardDiv,
  errorTitle: (props) => getUserManagementCss(props)?.errorTitle,
};
