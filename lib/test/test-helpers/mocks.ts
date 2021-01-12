/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as athom from "athom-api";
import { EventEmitter } from "events";
import { HomeyAPIMockManager } from "./compose-helpers";
import { HomeyCapability } from "../../enums/HomeyCapability";
import { HomeyCapabilityTypes } from "../../@types/HomeyCapabilityTypes";
import { HomeyClass } from "../../enums/HomeyClass";

export function setupDevices(devices: Array<{
    id: string,
    deviceClass: HomeyClass,
    capabilities: Array<{capability: HomeyCapability, startValue: HomeyCapabilityTypes[HomeyCapability]}>,
    name: string,
  }>) {

  const athomDevices: Array<athom.HomeyAPI.ManagerDevices.Device> = devices.map(({
    id, deviceClass, capabilities, name
  }) => {
    const device = {
      available: true,
      id,
      name,
      class: deviceClass,
      capabilities: capabilities.map(({ capability }) => capability),
      capabilitiesObj: {},
      data: { id },
      driverId: "Foobar"
    } as Omit<athom.HomeyAPI.ManagerDevices.Device, "capabilitiesObj"> & {
      capabilitiesObj: {
        [capability: string]: {
          value: unknown,
          lastUpdated: string,
          id: string,
          _eventEmitter: EventEmitter
        }
      }
    };

    for(const { capability, startValue } of capabilities) {
      device.capabilitiesObj[capability] = {
        value: startValue,
        lastUpdated: new Date().toISOString(),
        id: capability,
        _eventEmitter: new EventEmitter()
      };

      device.makeCapabilityInstance = (capabilityId: string, listener: (value: unknown) => void): athom.HomeyAPI.ManagerDevices.Device.CapabilityInstance => {
        class CapabilityInstance implements athom.HomeyAPI.ManagerDevices.Device.CapabilityInstance {
          values: string[] = {} as any;
          type: string = {} as any;
          min: number = {} as any;
          max: number = {} as any;
          decimals: number = {} as any;
          step: number = {} as any;
          title: string = {} as any;
          units: string = {} as any;
          desc: Date = {} as any;
          public destroy = () => device.capabilitiesObj[capabilityId]._eventEmitter.removeListener("change", listener);
          public setValue = (value: unknown) => {
            device.capabilitiesObj[capabilityId].value = value;

            (device.capabilitiesObj[capabilityId]._eventEmitter.listeners("change") as Array<typeof listener>)
              .filter(l => l !== listener)
              .forEach(l => l(value));

            return Promise.resolve();
          };
          public device = device;
          public capability = capabilityId;
          public get value() {
            return device.capabilitiesObj[capabilityId].value;
          }
          public lastChanged = new Date();
          public id = capabilityId;
          public getable = true;
          public setable = true;
        }
        device.capabilitiesObj[capabilityId]._eventEmitter.on("change", listener);
        return new CapabilityInstance();
      };
    }

    return device;
  });

  HomeyAPIMockManager.set("devices", { getDevices: () => Promise.resolve(Object.fromEntries(athomDevices.map(device => [device.id, device]))) });

  return athomDevices;
}
