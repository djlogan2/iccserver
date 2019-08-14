import React, { Component } from "react";

class AppContainerDJL extends Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-default navbar-static-top">
          <div className="container">
            <div className="navbar-header">
              <a className="navbar-brand" href="#/">
                Chess App
              </a>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

const mongoDjl = Mongo.Collection("djl");
const AppContainer = withTracker(({ id }) => {
  const djlHandle = Meteor.subscribe('djl');
  const loading = !djlHandle.ready();
  const allDjl = mongoDjl.find();
  const listExists = !loading && !!allDjl;
  return {
    loading,
    allDjl,
    listExists,
    todos: listExists ? list.todos().fetch() : [],
  };
})(ListPage);

export default ListPageContainer;