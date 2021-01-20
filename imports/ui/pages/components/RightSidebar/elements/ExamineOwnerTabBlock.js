import React from "react";
import { translate } from "../../../../HOCs/translate";

const ExamineOwnerTabBlock = ({ game, translate }) => {
  const handleAddExaminer = (game_id, id_to_add) => {
    return () => {
      let call = "localAddObserver";

      if (!!game.examiners && game.examiners.some(ex => ex.id === Meteor.userId())) {
        call = "localAddExaminer";
      }

      Meteor.call(call, call, game_id, id_to_add, error => {
        if (error) {
          console.error(error);
        }
      });
    };
  };

  const handleRemoveExaminer = (game_id, id_to_remove) => {
    let call = "localRemoveObserver";

    if (!!game.examiners && game.examiners.some(ex => ex.id === Meteor.userId())) {
      call = "localRemoveExaminer";
    }

    return () => {
      Meteor.call(call, call, game_id, id_to_remove, error => {
        if (error) {
          console.error(error);
        }
      });
    };
  };

  if (game.owner === Meteor.userId()) {
    return (
      <div className="examine-owner-tab-block">
        <div className="examine-owner-tab-block__head">
          <span className="examine-owner-tab-block__head-right">
            {translate("observing", { quantity: game.observers.length })}
          </span>
        </div>
        <ul className="examine-owner-tab-block__list">
          {game.observers.map(observerItem => {
            const isExaminer = game.examiners.filter(
              examinerItem => examinerItem.id === observerItem.id
            ).length;

            return (
              <li key={observerItem.username} className="examine-owner-tab-block__list-item">
                {isExaminer ? (
                  <button
                    onClick={handleRemoveExaminer(game._id, observerItem.id)}
                    className="examine-observer-tab-block__list-item__move-pieces-btn examine-observer-tab-block__list-item__move-pieces-btn--active"
                  />
                ) : (
                  <button
                    onClick={handleAddExaminer(game._id, observerItem.id)}
                    className="examine-observer-tab-block__list-item__move-pieces-btn"
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
    <div className="examine-owner-tab-block">
      <div className="examine-owner-tab-block__head">
        <span className="examine-owner-tab-block__head-right">
          {translate("observing", { quantity: game.observers.length })}
        </span>
      </div>
      <ul className="examine-owner-tab-block__list">
        {game.observers.map(observerItem => {
          return (
            <li key={observerItem.username} className="examine-owner-tab-block__list-item">
              {observerItem.username}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default translate("Examine.ExamineOwnerTabBlock")(ExamineOwnerTabBlock);
