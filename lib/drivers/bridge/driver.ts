import * as Homey from "homey";

export default class BridgeDriver extends Homey.Driver {
  onInit() {
    this.log("Driver started.");
    return Promise.resolve();
  }

  onPair(session: Parameters<Homey.Driver["onPair"]>[0]) {
    // This app shall be represented as single HomeKit bridge.
    // Consequently, the pairing list is hardcoded to be a single device.
    session.setHandler("list_devices", () => Promise.resolve([{
      name: "HomeKit bridge",
      data: { id: 1 },
      settings: {}
    }]));
  }
}

module.exports = BridgeDriver;
