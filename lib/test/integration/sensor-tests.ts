import * as test from "tape";
import { Characteristic, Service } from "hap-nodejs";
import {
  compose,
  withHomeyApp
} from "../test-helpers/compose-helpers";
import { HomeyCapability } from "../../enums/HomeyCapability";
import { HomeyClass } from "../../enums/HomeyClass";
import { timeout } from "../test-helpers/timeout";

test("Expected Homey sensor device with a HomeKit Sensor.", compose(
  withHomeyApp({
    devices: [
      {
        capabilities: [
          { capability: HomeyCapability.measure_temperature, startValue: 20 },
          { capability: HomeyCapability.measure_humidity, startValue: 20 },
          { capability: HomeyCapability.measure_co, startValue: 20 },
          { capability: HomeyCapability.measure_co2, startValue: 20 },
          { capability: HomeyCapability.measure_pm25, startValue: 20 },
          { capability: HomeyCapability.alarm_motion, startValue: false },
        ],
        deviceClass: HomeyClass.sensor,
        name: "My sensor Device",
        id: "my-sensor"
      }
    ]
  }),
  async({ devices, bridge }, t) => {
    const [accessory] = bridge.getAccessories();
    const [sensorDevice] = devices;

    const temperatureService = accessory.services.find(service => service.UUID === Service.TemperatureSensor.UUID);
    const temperatureCharacteristic = temperatureService?.characteristics.find(characteristic => characteristic.UUID === Characteristic.CurrentTemperature.UUID);
    t.ok(temperatureCharacteristic, "Expected the Accessory to have a CurrentTemperature characteristic");

    const promiseHomeKitChangeCurrentTemperature = new Promise<{ oldValue: unknown, newValue: unknown }>(resolve => temperatureCharacteristic?.once("change", resolve));
    sensorDevice.makeCapabilityInstance(HomeyCapability.measure_temperature, () => void 0).setValue(10);
    const temperatureValue = await timeout(promiseHomeKitChangeCurrentTemperature, { message: "HomeKit tampered never changed" });
    t.equal(temperatureValue.newValue, 10, "Expected HomeKit to react to 'measure_temperature' changes from Homey");

    const co2Service = accessory.services.find(service => service.UUID === Service.CarbonDioxideSensor.UUID);
    const co2Characteristic = co2Service?.characteristics.find(characteristic => characteristic.UUID === Characteristic.CarbonDioxideLevel.UUID);
    t.ok(co2Characteristic, "Expected the Accessory to have a CarbonDioxideLevel characteristic");

    const coService = accessory.services.find(service => service.UUID === Service.CarbonMonoxideSensor.UUID);
    const coCharacteristic = coService?.characteristics.find(characteristic => characteristic.UUID === Characteristic.CarbonMonoxideLevel.UUID);
    t.ok(coCharacteristic, "Expected the Accessory to have a CarbonMonoxideLevel characteristic");

    const humidityService = accessory.services.find(service => service.UUID === Service.HumiditySensor.UUID);
    const humidityCharacteristic = humidityService?.characteristics.find(characteristic => characteristic.UUID === Characteristic.CurrentRelativeHumidity.UUID);
    t.ok(humidityCharacteristic, "Expected the Accessory to have a CurrentRelativeHumidity characteristic");

    const pm25Service = accessory.services.find(service => service.UUID === Service.AirQualitySensor.UUID);
    const pm25Characteristic = pm25Service?.characteristics.find(characteristic => characteristic.UUID === Characteristic.PM2_5Density.UUID);
    t.ok(pm25Characteristic, "Expected the Accessory to have a PM2_5Density characteristic");

    const motionService = accessory.services.find(service => service.UUID === Service.MotionSensor.UUID);
    const motionCharacteristic = motionService?.characteristics.find(characteristic => characteristic.UUID === Characteristic.MotionDetected.UUID);
    t.ok(motionCharacteristic, "Expected the Accessory to have a MotionDetected characteristic");
  }
));
