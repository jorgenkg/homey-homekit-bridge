import * as athom from "athom-api";
import * as Homey from "homey";
import debug = require("debug");
import { ImportMock } from "ts-mock-imports";

const HomeyDeviceIMockManager = ImportMock.mockOther(Homey, "Device", class _ {
  #store: Record<string, unknown> = {}
  log = (message: string) => debug("homeymock:device:debug")(message);
  error = (message: string) => debug("homeymock:device:error")(message);
  getStore = () => this.#store
  setStoreValue = (key: string, value: unknown) => {
    this.#store[key] = value;
  }
  homey = ({
    on: (event: string, listener: (...args: any[]) => void) => {},
    log: (message: string) => debug("homeymock:device:debug")(message),
    error: (message: string) => debug("homeymock:device:error")(message),
    setTimeout: global.setTimeout as any,
    clearTimeout: global.clearTimeout as any
  } as Partial<Homey.Device.Homey>)
} as any);
const HomeyDriverIMockManager = ImportMock.mockOther(Homey, "Driver", class _ {
  log = (message: string) => debug("homeymock:driver:debug")(message);
  error = (message: string) => debug("homeymock:driver:error")(message);
} as any);
export const HomeyAPIMockManager = ImportMock.mockClass(athom, "HomeyAPI");
athom.HomeyAPI.forCurrentHomey = () => Promise.resolve(HomeyAPIMockManager.getMockInstance());

import * as BridgeDevice from "../../drivers/bridge/device";
import * as tape from "tape";
import { HomeyCapability } from "../../enums/HomeyCapability";
import { HomeyCapabilityTypes } from "../../@types/HomeyCapabilityTypes";
import { HomeyClass } from "../../enums/HomeyClass";
import { Middleware, TestComposer } from "./compose-types.js";
import { setupDevices } from "./mocks";
import type { default as IBridgeDevice } from "../../drivers/bridge/device";

export const compose: TestComposer = (...composers: unknown[]) => {
  const test = composers.pop() as (...args: unknown[]) => Promise<void>;
  const results: unknown[] = [];

  return async function _compose(t: tape.Test): Promise<void> {
    if (composers.length === 0) {
      await test(...results, t);
    }
    else {
      const middleware = composers.shift() as Middleware<unknown>; // leftmost middleware
      await middleware(
        async(result: unknown) => {
          if(result !== undefined) {
            results.push(result);
          }
          await _compose(t);
        }
      );
    }
  };
};

type DeviceMock = {
  id: string,
  deviceClass: HomeyClass,
  capabilities: Array<{capability: HomeyCapability, startValue: HomeyCapabilityTypes[HomeyCapability]}>,
  name: string;
};



export function withHomeyApp({ devices }: { devices: Array<DeviceMock> }): Middleware<{bridge: IBridgeDevice, devices: Array<athom.HomeyAPI.ManagerDevices.Device> }> {
  return async next => {
    const athomDevices = setupDevices(devices);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const bridge: IBridgeDevice = new (BridgeDevice as unknown as new () => any)();
    await bridge.onInit();

    let error: Error | undefined;

    await next({
      bridge,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      devices: athomDevices
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
    }).catch(err => (error = err));

    bridge.close();

    if(error) {
      throw error;
    }
  };
}
