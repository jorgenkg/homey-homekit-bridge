import * as Homey from "homey";

export default class HomekitBridge extends Homey.App {
  onInit() {
    this.log("Bridge app is running...");
    return Promise.resolve();
  }
}
