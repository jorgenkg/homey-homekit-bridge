import * as Homey from "homey";

export default class HomekitBridge extends Homey.App {
  onInit() {
    this.log("Homey HomeKit Bridge is running...");
    return Promise.resolve();
  }
}
