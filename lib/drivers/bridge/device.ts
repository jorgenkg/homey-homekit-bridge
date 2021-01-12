import * as athom from "athom-api";
import * as crypto from "crypto";
import * as Homey from "homey";
import * as util from "util";
import {
  AccessoryEventTypes, Bridge, Categories,
  HAPStorage, uuid
} from "hap-nodejs";
import { BaseDevice } from "./devices/BaseDevice";
import {
  Button, HomeAlarm, Light, Remote, Sensor
} from "./devices";
import { HomeyClass } from "../../enums/HomeyClass";


const HOMEKIT_PINCODE = "111-11-111";

type BridgeStore = Partial<{
  macAddress: string;
}>

export default class BridgeDevice extends Homey.Device {
  bridge?: Bridge;
  private api?: athom.HomeyAPI;

  async onInit() {
    this.log("Bridge device initializing...");

    // Define storage path an Homey device only.
    if(process.env.TEST !== "1") {
      HAPStorage.setCustomStoragePath("/userdata/persist");
    }

    this.bridge = new Bridge("Homey Bridge", uuid.generate("homey-bridge"));

    this.bridge.on(AccessoryEventTypes.IDENTIFY, (paired, callback) => callback(null));

    let { macAddress } = this.getStore() as BridgeStore;

    if(macAddress === undefined) {
      macAddress = this.generateMacAddress();
      await this.setStoreValue("macAddress", macAddress);
      this.log(`Generated new MAC address: ${macAddress}`);
    }
    else {
      this.log(`Reusing MAC address: ${macAddress}`);
    }


    this.bridge.publish({
      username: macAddress,
      pincode: HOMEKIT_PINCODE,
      category: Categories.BRIDGE
    }, false);
    this.log(`Waiting for HAP server to start listening with username ${macAddress}...`);
    await new Promise(resolve => this.bridge?.on(AccessoryEventTypes.LISTENING, resolve));
    this.log("HAP server ready.");

    const mappedDevices = await this.initializeMappedHomeyDevices();


    if(mappedDevices.length > 0) {
      const accessories = mappedDevices.map(mappedDevice => mappedDevice.getAccessory());

      this.bridge.addBridgedAccessories(accessories);
      this.log(`Initialized ${accessories.length} accessories`);
    }
    else {
      this.log("Found no devices in Homey");
    }


    this.homey.on("unload", () => {
      try {
        this.log("Closing device...");
        this.close();
        this.log("Device closed.");
      }
      catch(error) {
        this.error(`Error: ${util.inspect(error, { depth: null, breakLength: Infinity })}`);
      }
    });
  }

  private async initializeMappedHomeyDevices(): Promise<Array<BaseDevice<HomeyClass>>> {
    this.api = athom.HomeyAPI.forCurrentHomey(this.homey);
    const devices = Object.values(await this.api.devices.getDevices());

    this.log(`Found ${devices.length} devices`);

    const mappedDevices : Array<BaseDevice<HomeyClass>> = [];

    for(const device of devices) {
      const deviceClass = device.class as HomeyClass;

      if(deviceClass === HomeyClass.button) {
        const button = new Button(device, this.homey);
        await button.initialize();
        mappedDevices.push(button);
        this.log(`Adding '${deviceClass}' device from device ID ${device.id}`);
      }
      else if(deviceClass === HomeyClass.light) {
        const light = new Light(device, this.homey);
        await light.initialize();
        mappedDevices.push(light);
        this.log(`Adding '${deviceClass}' device from device ID ${device.id}`);
      }
      else if(deviceClass === HomeyClass.homealarm) {
        const homealarm = new HomeAlarm(device, this.homey);
        await homealarm.initialize();
        mappedDevices.push(homealarm);
        this.log(`Adding '${deviceClass}' device from device ID ${device.id}`);
      }
      else if(deviceClass === HomeyClass.sensor) {
        const sensor = new Sensor(device, this.homey);
        await sensor.initialize();
        mappedDevices.push(sensor);
        this.log(`Adding '${deviceClass}' device from device ID ${device.id}`);
      }
      else if(deviceClass === HomeyClass.remote) {
        const sensor = new Remote(device, this.homey);
        await sensor.initialize();
        mappedDevices.push(sensor);
        this.log(`Adding '${deviceClass}' device from device ID ${device.id}`);
      }
      else {
        this.log(`Unsupported device class '${deviceClass}' from device ${device.id}: ${util.inspect(device, { breakLength: Infinity, depth: null })}`);
      }
    }

    return mappedDevices;
  }

  public getAccessories() {
    return this.bridge?.bridgedAccessories.filter(accessory => accessory.UUID !== null) || [];
  }

  private generateMacAddress() {
    const characters = crypto.randomBytes(6).toString("hex").toUpperCase().split("");
    const macAddressParts: string[] = [];

    for(let i = 0;i < characters.length;i += 2) {
      macAddressParts.push(`${characters[i]}${characters[i + 1]}`);
    }

    return macAddressParts.join(":");
  }

  public close() {
    this.bridge?.unpublish();
  }
}
