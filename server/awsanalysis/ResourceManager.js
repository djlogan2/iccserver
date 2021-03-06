import { Logger } from "../../lib/server/Logger";
const log = { debug: text => console.log(text) }; //new Logger("server/LoadBalancer_js");
export default class ResourceManager {
  /**
   *
   * @param options
   * @param options.create_resource - Function that returns a promise that creates one or more resources.
   * An optional parameter may be passed with a request count. A null/undefined will just return a resource.
   * A request count will expect an array of resources to be returned from the promise.
   * @param options.destroy_resource - Function that destroys a single resource
   * @param options.reserve.min - Minimum number of resources to keep. New unused resources will be allocated to maintain this value
   * @param options.reserve.max - Maximum number waiting resources to keep. Resources beyond this will be freed
   */
  constructor(options) {
    const _options = options || {};
    if (!_options.create_resource)
      throw new Error("Unable to create load balancer", "A resource creation function is required");
    if (typeof options.create_resource !== "function")
      throw new Error("Unable to create load balancer", "Destroy function must be a function");
    this.create_resource = options.create_resource;
    if (!!_options.destroy_resource) {
      if (typeof options.destroy_resource !== "function")
        throw new Error("Unable to create load balancer", "Destroy function must be a function");
    } else this.destroy_resource = () => Promise.resolve();
    if (_options?.reserve?.min) this.reserve_min = _options.reserve.min;
    if (_options?.reserve?.max) this.reserve_max = _options.reserve.max;
    this.busy_resources = [];
    this.waiting_resources = [];
    this.acquisition_callbacks = [];
    this.acquisition_pending = false;
    if (!!this.reserve_min) this.acquire_resources(this.reserve_min);
  }

  acquire_resources(count, callback) {
    log.debug("acquire_resources, count=" + count);
    if (!!callback && typeof callback === "function") this.acquisition_callbacks.push(callback);

    if (this.acquisition_pending) return;

    log.debug("acquiring resources started");
    this.acquisition_pending = true;
    this.create_resource(count).then(resources => {
      log.debug(
        "acquiring resources complete, old waiting resource count=" + this.waiting_resources.length
      );
      if (Array.isArray(resources)) this.waiting_resources.push(...resources);
      else this.waiting_resources.push(resources);
      this.waiting_resources.sort((r1, r2) => r2.weight() || 0 - r2.weight() || 0);
      log.debug("New waiting resource count=" + this.waiting_resources.length);
      const cbs = this.acquisition_callbacks;
      this.acquisition_callbacks = [];
      this.acquisition_pending = false;
      log.debug("Resource acquisition executing " + cbs.length + " callbacks");
      cbs.forEach(cb => cb());
    });
  }

  allocate() {
    log.debug("allocate");
    if (!!this.waiting_resources.length) {
      log.debug("Returning an available resource");
      const resource = this.waiting_resources.shift();
      this.busy_resources.push(resource);
      this.ensure_minimum();
      return Promise.resolve(resource);
    }

    log.debug("allocate returning a promise because we got caught with our pants down");
    return new Promise((resolve, reject) => {
      log.debug("allocate pants down promise started");
      this.acquire_resources(1, () => {
        log.debug("allocate notified resources acquired, try recursively to return a resource");
        this.allocate().then(resource => resolve(resource));
      });
    });
  }

  ensure_minimum() {
    log.debug("ensure_minimum");
    if (!!this.reserve_min && this.reserve_min > this.waiting_resources.length)
      this.acquire_resources(this.reserve_min - this.waiting_resources.length);
  }

  ensure_maximum() {
    log.debug("ensure_maximum");
    if (!!this.reserve_max && this.reserve_max < this.waiting_resources.length) {
      const count = this.waiting_resources.length - this.reserve_max;
      const to_be_deleted = this.waiting_resources.splice(
        this.waiting_resources.length - count,
        count
      );
      log.debug("Deleting " + to_be_deleted.length + " resources");
      this.destroy_resource(to_be_deleted);
    }
  }

  /**
   *
   * @param resource - The resource to be returned to the pool
   */
  free(resource) {
    log.debug("free");
    this.busy_resources = this.busy_resources.filter(r => r.id !== resource.id);
    this.waiting_resources.push(resource);
    this.waiting_resources.sort((r1, r2) => r2.weight() || 0 - r1.weight() || 0);
    this.ensure_maximum();
  }

  /**
   *
   * @param minimum - The new minimum number of resources to maintain
   */
  set_resource_minimum(minimum) {
    if (!!minimum) this.reserve_min = minimum;
    else delete this.reserve_min;
    this.ensure_minimum();
  }

  /**
   *
   * @param maximum - The new maximum number of resources to maintain
   */
  set_resource_maximum(maximum) {
    if (!!maximum) this.reserve_max = maximum;
    else delete this.reserve_max;
    this.ensure_maximum();
  }
}
