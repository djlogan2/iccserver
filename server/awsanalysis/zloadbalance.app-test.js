import chai from "chai";
import ResourceManager from "./ResourceManager";

describe("load balancer", function() {
  function create(count) {
    console.log("create called for count=" + count);
    return new Promise((resolve, reject) => {
      console.log("create promise start");
      const objects = [];
      const ct = count || 1;
      for (let x = 0; x < ct; x++) {
        objects.push({ weight: () => 0 });
      }
      resolve(objects);
      console.log("create promise end, resources=" + objects.length);
    });
  }
  it("should set a minimum when specified", function(done) {
    const load_balancer = new ResourceManager({
      create_resource: create,
      destroy_resource: rarray => {},
      reserve: { max: 10, min: 5 }
    });
    load_balancer.allocate().then(resource => {
      const lb = load_balancer;
      console.log("here");
      done();
    });
  });
});
