import React from "react";
import { compose } from "redux";
import injectSheet from "react-jss";
import { translate } from "../../../HOCs/translate";

const styles = {
  pgnIcon: {
    width: "25px",
    height: "25px",
  },
  pgnButton: {
    display: "block",
    padding: "3px 2px",
    width: "30px",
    "&:hover": {
      backgroundColor: "#2a9bdc",
      borderRadius: "3px",
    },
    "&:focus": {
      outline: "1px solid rgba(0, 0, 0, .3)",
    },
  },
};

const ExportPgnButton = ({ id, translate, classes, src }) => (
  <a href={"export/pgn/history/" + id} className={classes.pgnButton}>
    <img src={src} className={classes.pgnIcon} alt={translate("pgnIconAlt")} />
  </a>
);

export default compose(translate("Common.gameListModal"), injectSheet(styles))(ExportPgnButton);
