import * as test from "tape";
import { Characteristic, Service } from "hap-nodejs";
import {
  compose,
  withHomeyApp
} from "../test-helpers/compose-helpers";
import { HomeyCapability } from "../../enums/HomeyCapability";
import { HomeyClass } from "../../enums/HomeyClass";
import { sleep } from "../test-helpers/sleep";
import { timeout } from "../test-helpers/timeout";

test("Expected Homey light device with Dim and Onoff to be mapped to a HomeKit Lightbulb with Brightness and On.", compose(
  withHomeyApp({
    devices: [
      {
        capabilities: [
          { capability: HomeyCapability.windowcoverings_set, startValue: 100 },
        ],
        deviceClass: HomeyClass.sunshade,
        name: "My Window Covering Device",
        id: "my-windowcoverings"
      }
    ]
  }),
  async({ bridge, devices }, t) => {
    const [lightDevice] = devices;
    const [accessory] = bridge.getAccessories();
    const windowCovering = accessory.services.find(service => service.UUID === Service.WindowCovering.UUID);

    t.ok(windowCovering, "Expected the Accessory to have a WindowCovering service");

    const targetPosition = windowCovering?.characteristics.find(characteristic => characteristic.UUID === Characteristic.TargetPosition.UUID);

    const promiseHomeKitChangePosition = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => targetPosition?.once("change", resolve));

    lightDevice.makeCapabilityInstance(HomeyCapability.windowcoverings_set, () => void 0).setValue(0.5);

    const positionValue = await timeout(promiseHomeKitChangePosition, { message: "HomeKit position never changed" });

    t.equal(positionValue.newValue, 50, "Expected HomeKit to react to 'windowcoverings_set' changes from Homey");
  }
));
