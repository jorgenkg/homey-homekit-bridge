import {
  AirQualitySensor, CarbonDioxideSensor, CarbonMonoxideSensor, HumiditySensor, MotionSensor, TemperatureSensor
} from "hap-nodejs/dist/lib/definitions";
import { BaseDevice } from "./BaseDevice";
import { CarbonDioxideCapability } from "../capabilities/CarbonDioxideCapability";
import { CarbonMonoxideCapability } from "../capabilities/CarbonMonoxideCapability";
import { Categories, Service } from "hap-nodejs";
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
        const service = new TemperatureSensor("Temperature", subType);
        const capability = new TemperatureCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.measure_co2) {
        const service = new CarbonDioxideSensor("CO2", subType);
        const capability = new CarbonDioxideCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.measure_co) {
        const service = new CarbonMonoxideSensor("CO", subType);
        const capability = new CarbonMonoxideCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.measure_humidity) {
        const service = new HumiditySensor("Humidity", subType);
        const capability = new HumidityCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.measure_pm25) {
        const service = new AirQualitySensor("PM 2.5", subType);
        const capability = new Pm25Capability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
      }
      else if(capabilityType === HomeyCapability.alarm_motion) {
        const service = new MotionSensor("Motion", subType);
        const capability = new MotionCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(service);
        services.push(service);
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
