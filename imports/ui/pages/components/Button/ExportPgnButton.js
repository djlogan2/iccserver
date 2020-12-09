import React from "react";
import { compose } from "redux";
import injectSheet from "react-jss";
import { translate } from "../../../HOCs/translate";

const styles = {
  pgnIcon: {
    width: "25px",
    height: "25px"
  }
};

const ExportPgnButton = ({ id, translate, classes }) => (
  <a href={"export/pgn/history/" + id} className="pgnbtn">
    <img src="images/pgnicon.png" className={classes.pgnIcon} alt={translate("pgnIconAlt")} />
  </a>
);

export default compose(
  translate("Common.gameListModal"),
  injectSheet(styles)
)(ExportPgnButton);
