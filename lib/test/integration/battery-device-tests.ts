import * as test from "tape";
import { Characteristic, Service } from "hap-nodejs";
import {
  compose,
  withHomeyApp
} from "../test-helpers/compose-helpers";
import { HomeyCapability } from "../../enums/HomeyCapability";
import { HomeyClass } from "../../enums/HomeyClass";

test("Expected Homey sensor device with a HomeKit Sensor.", compose(
  withHomeyApp({
    devices: [
      {
        capabilities: [
          { capability: HomeyCapability.measure_battery, startValue: 50 },
          { capability: HomeyCapability.alarm_battery, startValue: false },
        ],
        deviceClass: HomeyClass.sensor,
        name: "My Battery Device",
        id: "my-sensor"
      }
    ]
  }),
  async({ bridge }, t) => {
    const [accessory] = bridge.getAccessories();

    const batteryService = accessory.services.find(service => service.UUID === Service.Battery.UUID);
    const batteryCharacteristic = batteryService?.characteristics.find(characteristic => characteristic.UUID === Characteristic.BatteryLevel.UUID);
    t.ok(batteryCharacteristic, "Expected the Accessory to have a BatteryLevel characteristic");

    const batteryAlertCharacteristic = batteryService?.characteristics.find(characteristic => characteristic.UUID === Characteristic.StatusLowBattery.UUID);
    t.ok(batteryAlertCharacteristic, "Expected the Accessory to have a StatusLowBattery characteristic");
  }
));
