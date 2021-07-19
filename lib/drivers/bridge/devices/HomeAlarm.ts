import { AlarmTamperCapability } from "../capabilities/AlarmTamperCapability";
import { BaseDevice } from "./BaseDevice";
import { Categories, Service } from "hap-nodejs";
import { EventEmitter } from "events";
import { HomeAlarmCapability } from "../capabilities/HomeAlarmCapability";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyClass } from "../../../enums/HomeyClass";
import { SecuritySystem } from "hap-nodejs/dist/lib/definitions";
import type { Device } from "homey";
import type { HomeyAPI } from "athom-api";
import type StrictEventEmitter from "strict-event-emitter-types";

type LightEventEmitter = StrictEventEmitter<EventEmitter, {
  "changeLightMode": (mode: "color"|"temperature") => typeof mode;
}>

export class HomeAlarm extends BaseDevice<HomeyClass.homealarm> {
  protected eventEmitter: LightEventEmitter = new EventEmitter();

  public constructor(device: HomeyAPI.ManagerDevices.Device, homey: Device.Homey) {
    super(device, HomeyClass.homealarm, homey);
  }

  initialize(): void {
    this.accessory.category = Categories.SECURITY_SYSTEM;
    const services: Record<string, Service> = {};

    for(const { capabilityId, subType = "", capabilityType } of this.getCapabilitiesWithSubtypes()) {
      if(!(subType in services)) {
        services[subType] = new SecuritySystem("Alarm", subType);
      }

      if(capabilityType === HomeyCapability.homealarm_state) {
        const capability = new HomeAlarmCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(services[subType]);
      }
      else if(capabilityType === HomeyCapability.alarm_tamper) {
        const capability = new AlarmTamperCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(services[subType]);
      }
      else {
        this.homey.error(`Unsupported capability on device ${this.device.id}: ${capabilityType} from capabilityId '${capabilityId}'`);
      }
    }

    for(const service of Object.values(services)) {
      this.addService(service);
    }
  }
}
