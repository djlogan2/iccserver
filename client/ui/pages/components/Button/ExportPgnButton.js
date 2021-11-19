import React from "react";
import { compose } from "redux";
import { translate } from "../../../HOCs/translate";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";

const ExportPgnButton = ({ id, translate, classes, src }) => (
  <a href={"export/pgn/history/" + id} className={classes.pgnButton}>
    <img src={src} className={classes.pgnIcon} alt={translate("pgnIconAlt")} />
  </a>
);

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  translate("Common.gameListModal"),
  withDynamicStyles("css.exportPngButtonCss")
)(ExportPgnButton);
