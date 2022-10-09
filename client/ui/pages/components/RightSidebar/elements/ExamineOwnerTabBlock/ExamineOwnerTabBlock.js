import classNames from "classnames";
import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import { translate } from "../../../../../HOCs/translate";
import { withDynamicStyles } from "../../../../../HOCs/withDynamicStyles";

const ExamineOwnerTabBlock = ({ game, translate, classes }) => {
  const handleAddExaminer = (game_id, id_to_add) => {
    return () => {
      let call = "localAddObserver";

      if (!!game.examiners && game.examiners.some((ex) => ex.id === Meteor.userId())) {
        call = "localAddExaminer";
      }

      log.debug(`Call ${call} called`);
      Meteor.call(call, call, game_id, id_to_add, (error) => {
        if (error) {
          console.error(error);
        }
      });
    };
  };

  const handleRemoveExaminer = (game_id, id_to_remove) => {
    let call = "localRemoveObserver";

    if (!!game.examiners && game.examiners.some((ex) => ex.id === Meteor.userId())) {
      call = "localRemoveExaminer";
    }

    return () => {
      Meteor.call(call, call, game_id, id_to_remove, (error) => {
        if (error) {
          console.error(error);
        }
      });
    };
  };

  if (game.owner === Meteor.userId()) {
    return (
      <div className={classes.container}>
        <div className={classes.head}>
          <span>{translate("observing", { quantity: game.observers.length })}</span>
        </div>
        <ul className={classes.list}>
          {game.observers.map((observerItem) => {
            const isExaminer = game.examiners.filter(
              (examinerItem) => examinerItem.id === observerItem.id
            ).length;

            return (
              <li key={observerItem.username} className={classes.listItem}>
                {isExaminer ? (
                  <button
                    id="handle-remove-examiner"
                    onClick={handleRemoveExaminer(game._id, observerItem.id)}
                    className={classNames(classes.movePiecesButton, classes.movePiecesButtonActive)}
                  />
                ) : (
                  <button
                    id="handle-add-examiner"
                    onClick={handleAddExaminer(game._id, observerItem.id)}
                    className={classes.movePiecesButton}
                  />
                )}
                {observerItem.username}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <span>{translate("observing", { quantity: game.observers.length })}</span>
      </div>
      <ul className={classes.list}>
        {game.observers.map((observerItem, key) => {
          return (
            <li key={key} className={classes.listItem}>
              {observerItem.username}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.examineOwnerTabBlockCss"),
  translate("Examine.ExamineOwnerTabBlock")
)(ExamineOwnerTabBlock);
