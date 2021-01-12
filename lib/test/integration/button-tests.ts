import * as test from "tape";
import { Characteristic, Service } from "hap-nodejs";
import {
  compose,
  withHomeyApp
} from "../test-helpers/compose-helpers";
import { HomeyCapability } from "../../enums/HomeyCapability";
import { HomeyClass } from "../../enums/HomeyClass";
import { timeout } from "../test-helpers/timeout";

test("Expected Homey button device with button capability to be mapped to a HomeKit Switch that automatically resets to 'off'.", compose(
  withHomeyApp({
    devices: [
      {
        capabilities: [
          { capability: HomeyCapability.button, startValue: false },
        ],
        deviceClass: HomeyClass.button,
        name: "My Button Device",
        id: "my-button"
      }
    ]
  }),
  async({ bridge, devices }, t) => {
    const [buttonDevice] = devices;
    const [accessory] = bridge.getAccessories();
    const button = accessory.services.find(service => service.UUID === Service.Switch.UUID);
    const on = button?.characteristics.find(characteristic => characteristic.UUID === Characteristic.On.UUID);

    t.ok(on, "Expected the Accessory to have a On characteristic");

    const promiseHomeKitChangeOn = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => on?.once("change", resolve));

    buttonDevice.makeCapabilityInstance(HomeyCapability.button, () => void 0).setValue(true);

    const onValue = await timeout(promiseHomeKitChangeOn, { message: "HomeKit On never changed" });

    t.equal(onValue.newValue, true, "Expected HomeKit to react to 'button' changes from Homey");

    const promiseHomeKitChangeOnBackAgain = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => on?.once("change", resolve));
    await timeout(promiseHomeKitChangeOnBackAgain, { message: "HomeKit On never flipped back automatically" });
    t.pass("Expected switch to automatically reset to off.");
  }
));
