import * as test from "tape";
import { Characteristic, Service } from "hap-nodejs";
import {
  compose,
  withHomeyApp
} from "../test-helpers/compose-helpers";
import { HomeyCapability } from "../../enums/HomeyCapability";
import { HomeyClass } from "../../enums/HomeyClass";
import { SupportedHomeKitAlarmStates } from "../../enums/SupportedHomeKitAlarmStates";
import { timeout } from "../test-helpers/timeout";

test("Expected Homey homealarm device with homealarm_state and alarm_tamper to be mapped to a HomeKit Security System with Security System State and Tampered State.", compose(
  withHomeyApp({
    devices: [
      {
        capabilities: [
          { capability: HomeyCapability.homealarm_state, startValue: "disarmed" },
          { capability: HomeyCapability.alarm_tamper, startValue: false }
        ],
        deviceClass: HomeyClass.homealarm,
        name: "My Alarm",
        id: "my-alarm"
      }
    ]
  }),
  async({ bridge, devices }, t) => {
    const [alarmDevice] = devices;
    const [accessory] = bridge.getAccessories();
    const securitySystem = accessory.services.find(service => service.UUID === Service.SecuritySystem.UUID);
    const tampered = securitySystem?.characteristics.find(characteristic => characteristic.UUID === Characteristic.StatusTampered.UUID);
    const currentAlarmState = securitySystem?.characteristics.find(characteristic => characteristic.UUID === Characteristic.SecuritySystemCurrentState.UUID);
    const targetAlarmState = securitySystem?.characteristics.find(characteristic => characteristic.UUID === Characteristic.SecuritySystemTargetState.UUID);

    t.ok(tampered, "Expected the Accessory to have a Tampered characteristic");
    t.ok(currentAlarmState, "Expected the Accessory to have a SecuritySystemCurrentState characteristic");
    t.ok(targetAlarmState, "Expected the Accessory to have a SecuritySystemTargetState characteristic");

    const promiseHomeKitChangeTamperedState = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => tampered?.once("change", resolve));

    alarmDevice.makeCapabilityInstance(HomeyCapability.alarm_tamper, () => void 0).setValue(true);

    const tamperedValue = await timeout(promiseHomeKitChangeTamperedState, { message: "HomeKit tampered never changed" });

    t.equal(tamperedValue.newValue, 1, "Expected HomeKit to react to 'tampered' changes from Homey");

    const promiseHomeKitChangeCurrentState = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => currentAlarmState?.once("change", resolve));

    alarmDevice.makeCapabilityInstance(HomeyCapability.homealarm_state, () => void 0).setValue("armed");

    const currentAlarmStateValue = await timeout(promiseHomeKitChangeCurrentState, { message: "HomeKit SecuritySystemTargetState never changed" });

    t.equal(currentAlarmStateValue.newValue, SupportedHomeKitAlarmStates.AWAY_ARM, "Expected HomeKit to react to 'homealarm_state' changes from Homey");
  }
));
