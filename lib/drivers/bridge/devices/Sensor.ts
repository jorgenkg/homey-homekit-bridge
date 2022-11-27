import {
  AirQualitySensor,
  Battery,
  CarbonDioxideSensor,
  CarbonMonoxideSensor,
  HumiditySensor,
  MotionSensor,
  TemperatureSensor
} from "hap-nodejs/dist/lib/definitions";
import { BaseDevice } from "./BaseDevice";
import { BatteryLevelCapability } from "../capabilities/BatteryLevelCapability";
import { BatteryLowAlertCapability } from "../capabilities/BatteryLowAlertCapability";
import { CarbonDioxideCapability } from "../capabilities/CarbonDioxideCapability";
import { CarbonMonoxideCapability } from "../capabilities/CarbonMonoxideCapability";
import {
  Categories,
  Service
} from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyClass } from "../../../enums/HomeyClass";
import { HumidityCapability } from "../capabilities/HumidityCapability";
import { MotionCapability } from "../capabilities/MotionCapability";
import { Pm25Capability } from "../capabilities/Pm25Capability";
import { TemperatureCapability } from "../capabilities/TemperatureCapability";
import type { Device } from "homey";
import type { HomeyAPI } from "athom-api";

export class Sensor extends BaseDevice<HomeyClass.sensor> {
  public constructor(device: HomeyAPI.ManagerDevices.Device, homey: Device.Homey) {
    super(device, HomeyClass.sensor, homey);
  }

  initialize(): void {
    this.accessory.category = Categories.SENSOR;
    const services: Array<Service> = [];

    for(const { capabilityId, subType = "", capabilityType } of this.getCapabilitiesWithSubtypes()) {
      if(capabilityType === HomeyCapability.measure_temperature) {
        const name = this.device.name + (subType ? ` (${subType})` : "");
        const service = new TemperatureSensor(name, subType);
        const capability = new TemperatureCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.measure_co2) {
        const name = this.device.name + (subType ? ` (${subType})` : "");
        const service = new CarbonDioxideSensor(name, subType);
        const capability = new CarbonDioxideCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.measure_co) {
        const name = this.device.name + (subType ? ` (${subType})` : "");
        const service = new CarbonMonoxideSensor(name, subType);
        const capability = new CarbonMonoxideCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.measure_humidity) {
        const name = this.device.name + (subType ? ` (${subType})` : "");
        const service = new HumiditySensor(name, subType);
        const capability = new HumidityCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.measure_pm25) {
        const name = this.device.name + (subType ? ` (${subType})` : "");
        const service = new AirQualitySensor(name, subType);
        const capability = new Pm25Capability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.alarm_motion) {
        const name = this.device.name + (subType ? ` (${subType})` : "");
        const service = new MotionSensor(name, subType);
        const capability = new MotionCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.alarm_battery) {
        const existingBatteryService = services.find(s => s.UUID === Battery.UUID);
        const name = this.device.name + (subType ? ` (${subType})` : "");
        const service = existingBatteryService ?? new Battery(name, subType);
        const capability = new BatteryLowAlertCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        !existingBatteryService && services.push(service);
      }
      else if(capabilityType === HomeyCapability.measure_battery) {
        const existingBatteryService = services.find(s => s.UUID === Battery.UUID);
        const name = this.device.name + (subType ? ` (${subType})` : "");
        const service = existingBatteryService ?? new Battery(name, subType);
        const capability = new BatteryLevelCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        !existingBatteryService && services.push(service);
      }
      else {
        this.homey.error(`Unsupported capability on device ${this.device.id}: ${capabilityType} from capabilityId '${capabilityId}'`);
      }
    }

    for(const service of services) {
      this.addService(service);
    }
  }
}
