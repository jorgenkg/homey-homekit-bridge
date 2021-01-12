import * as Homey from "homey";

export default class BridgeDriver extends Homey.Driver {
  onInit() {
    this.log("Driver started.");
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  onPair(session: Parameters<Homey.Driver["onPair"]>[0]) {
    session.setHandler("list_devices", () => Promise.resolve([{
      name: "HomeKit bridge",
      data: { id: 1 },
      settings: {}
    }]));
  }
}
