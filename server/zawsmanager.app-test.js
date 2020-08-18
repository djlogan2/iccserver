describe("AWS Stockfish", function(){
  // manager
  //    get all instances
  //    for each instance
  //       have instance check its status. If check fails, terminate the instance and start another one.
  //
  //    watch games and users
  //       increase number of available engines when threshholds are met
  //       decrease number of available engines when threshholds are met
  it("should start a new instance when game/user/engine threshhold is met", function(){});
  it("should add an instance to the five minute shutdown queue when game/user/engine threshhold is met", function(){});
  it("should shut down an instance five minutes after it's been marked for termination", function(){});
  //
  //    await engine request
  //       return an engine from an instance with the fewest available
  //       return an engine from an instance on its way up
  //       Start an instance, and return an engine from this upcoming
  it("should return an engine if one is available, from the instance with the fewest available engines", function(){});
  it("should start a new instance if the number of available engines fall below the thresshold after allocating one", function(){});
  it("should wait for a new instance if we happen to have no engines available", function(){});
  it("should wait for an instance that is already on its way up if there is one", function(){});
  //
  //    engine release
  //       add this engine back to the available queue
  it("should make the engine available when releasing an engine", function(){});
  it("should mark an instance for termination when releasing an engine causes game/user/engine to fall below the thresshold", function(){});
  //
  //    when an instance is terminated outside of our control
  //    or when we get a spot instance warning
  //       mark it as such
  //       for all engines in use, find alternative engines (from above calls)
  //       notify new engine to get up to speed from old engine
  //       update number of available engines based on threshholds
  it("should move all engines from a dying instance to other places", function(){});
  it("should start a new instance if it has to in order to move engines from a dying instance to another one", function(){});
  it("will ask engines to transfer it's current status from the dying ones to new ones", function(){});
  it("will update the number of available engines after a 'dying' adjustment", function(){});
  //
  //    when an instance is created
  //       do the same thing for "for each instance" above - that is, check, install, set, etc.
  //       update number of available engines based on threshholds
  //
  // instance
  //    await check
  //       check instance status "/ok" -- install and start if necessary
  //       check engine status "/engineok" -- catastrophe if this fails after /ok
  //    engine request
  //       if one isn't available, catastrophe
  //       return an "engine" instance, and update the database marking it as allocated
  //    engine release
  //       update the database, marking it as available
  //    interval
  //       check engine and/or instance status
  //
  // engine
  //    await [uci command]
  //       if engine isn't ready, wait for it to be ready
  //       make the call (via get/post)
  //    await duplicateengine(other_engine)
  //       sets the options from other_engine
  //       sets the fen/position from other_engine
  //       ...so what happens if we have a go command in the other engine and a new queued command?
  //                 I say if there is a new queued command, we just start there.
  //                 It there isn't one, then it would re-issue the "go" from other_engine
  //    captures incoming url for infinite...
  //       sends the data to the connector
  //    terminating (called when the instance is terminating)
  //       sets the state to terminating, which will cause uci commands to await
  // connector
  //    ...
  it("")
  // instance
  // engine
  // connector
});
