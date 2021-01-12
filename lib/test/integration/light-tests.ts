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
          { capability: HomeyCapability.dim, startValue: 1 },
          { capability: HomeyCapability.onoff, startValue: true }
        ],
        deviceClass: HomeyClass.light,
        name: "My Light Device",
        id: "my-light"
      }
    ]
  }),
  async({ bridge, devices }, t) => {
    const [lightDevice] = devices;
    const [accessory] = bridge.getAccessories();
    const lightbulb = accessory.services.find(service => service.UUID === Service.Lightbulb.UUID);
    const brightness = lightbulb?.characteristics.find(characteristic => characteristic.UUID === Characteristic.Brightness.UUID);
    const on = lightbulb?.characteristics.find(characteristic => characteristic.UUID === Characteristic.On.UUID);

    t.ok(brightness, "Expected the Accessory to have a Brightness characteristic");
    t.ok(on, "Expected the Accessory to have a On characteristic");

    const promiseHomeKitChangeBrightness = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => brightness?.once("change", resolve));

    lightDevice.makeCapabilityInstance(HomeyCapability.dim, () => void 0).setValue(0.3);

    const dimValue = await timeout(promiseHomeKitChangeBrightness, { message: "HomeKit brightness never changed" });

    t.equal(dimValue.newValue, 30, "Expected HomeKit to react to 'dim' changes from Homey");

    const promiseHomeKitChangeOn = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => on?.once("change", resolve));

    lightDevice.makeCapabilityInstance(HomeyCapability.onoff, () => void 0).setValue(false);

    const onValue = await timeout(promiseHomeKitChangeOn, { message: "HomeKit On never changed" });

    t.equal(onValue.newValue, false, "Expected HomeKit to react to 'onoff' changes from Homey");
  }
));

test("Expected Homey light device which is currently switched off and triggered via Homey with both Dim and Onoff to first update the dim level and then the onoff status in HomeKit.", compose(
  withHomeyApp({
    devices: [
      {
        capabilities: [
          { capability: HomeyCapability.dim, startValue: 1 },
          { capability: HomeyCapability.onoff, startValue: false }
        ],
        deviceClass: HomeyClass.light,
        name: "My Light Device",
        id: "my-light"
      }
    ]
  }),
  async({ bridge, devices }, t) => {
    const [lightDevice] = devices;
    const [accessory] = bridge.getAccessories();
    const lightbulb = accessory.services.find(service => service.UUID === Service.Lightbulb.UUID);
    const brightness = lightbulb?.characteristics.find(characteristic => characteristic.UUID === Characteristic.Brightness.UUID);
    const on = lightbulb?.characteristics.find(characteristic => characteristic.UUID === Characteristic.On.UUID);

    const promiseHomeKitChangeBrightness = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => brightness?.once("change", resolve));
    const promiseHomeKitChangeOn = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => on?.once("change", resolve));

    const promiseDimChangedFirst = Promise
      .race([
        promiseHomeKitChangeOn.then(() => false),
        promiseHomeKitChangeBrightness.then(() => true),
      ]);

    lightDevice.makeCapabilityInstance(HomeyCapability.onoff, () => void 0).setValue(true);
    lightDevice.makeCapabilityInstance(HomeyCapability.dim, () => void 0).setValue(0.3);

    t.ok(await promiseDimChangedFirst, "Expected the dim level to be updated before changing the onoff status");
  }
));

test("Expected Homey light device which is currently switched off and triggered via HomeKit with both Dim and Onoff to first update the dim level and then the onoff status in Homey.", compose(
  withHomeyApp({
    devices: [
      {
        capabilities: [
          { capability: HomeyCapability.dim, startValue: 1 },
          { capability: HomeyCapability.onoff, startValue: false }
        ],
        deviceClass: HomeyClass.light,
        name: "My Light Device",
        id: "my-light"
      }
    ]
  }),
  async({ bridge, devices }, t) => {
    const [lightDevice] = devices;
    const [accessory] = bridge.getAccessories();
    const lightbulb = accessory.services.find(service => service.UUID === Service.Lightbulb.UUID);
    const brightness = lightbulb?.characteristics.find(characteristic => characteristic.UUID === Characteristic.Brightness.UUID);
    const on = lightbulb?.characteristics.find(characteristic => characteristic.UUID === Characteristic.On.UUID);



    const promiseHomeKitChangeBrightness = new Promise(resolve => lightDevice.makeCapabilityInstance(HomeyCapability.dim, resolve));
    const promiseHomeKitChangeOn = new Promise(resolve => lightDevice.makeCapabilityInstance(HomeyCapability.onoff, resolve));

    const promiseDimChangedFirst = Promise
      .race([
        promiseHomeKitChangeOn.then(() => false),
        promiseHomeKitChangeBrightness.then(() => true),
      ]);

    on?.setValue(true);
    brightness?.setValue(30);

    t.ok(await promiseDimChangedFirst, "Expected the dim level to be updated before changing the onoff status");
  }
));

test("Expected Homey light device to support multiple capabilities of the same type using dotted sub-qualifiers.", compose(
  withHomeyApp({
    devices: [
      {
        capabilities: [
          { capability: "dim.one" as HomeyCapability.dim, startValue: 1 },
          { capability: "dim.two" as HomeyCapability.dim, startValue: 1 },
        ],
        deviceClass: HomeyClass.light,
        name: "My Light Device",
        id: "my-light"
      }
    ]
  }),
  async({ bridge, devices }, t) => {
    const [lightDevice] = devices;
    const [accessory] = bridge.getAccessories();
    const [lightbulbOne, lightbulbTwo] = accessory.services.filter(service => service.UUID === Service.Lightbulb.UUID);
    const brightnessOne = lightbulbOne?.characteristics.find(characteristic => characteristic.UUID === Characteristic.Brightness.UUID);
    const brightnessTwo = lightbulbTwo?.characteristics.find(characteristic => characteristic.UUID === Characteristic.Brightness.UUID);

    const promiseHomeKitChangebrightnessOne = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => brightnessOne?.once("change", resolve));
    const promiseHomeKitChangebrightnessTwo = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => brightnessTwo?.once("change", resolve));

    lightDevice.makeCapabilityInstance("dim.two" as HomeyCapability.dim, () => void 0).setValue(0.3);

    await timeout(promiseHomeKitChangebrightnessTwo, { message: "dim.two never changed" });
    t.pass("Expected that changing the value of one of the dimmers should update HomeKit.");

    const brightnessOneChanged = await Promise.race([
      promiseHomeKitChangebrightnessOne.then(() => true),
      sleep(3000).then(() => false),
    ]);

    t.notOk(brightnessOneChanged, "Expected the other dimmer not to change value since it wasn't updated in Homey either.");
  }
));

