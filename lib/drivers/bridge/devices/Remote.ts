import { BaseDevice } from "./BaseDevice";
import { Categories, Service } from "hap-nodejs";
import { EventEmitter } from "events";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyClass } from "../../../enums/HomeyClass";
import { StatelessButtonCapability } from "../capabilities";
import { Switch } from "hap-nodejs/dist/lib/definitions";
import type { Device } from "homey";
import type { HomeyAPI } from "athom-api";
import type StrictEventEmitter from "strict-event-emitter-types";

type LightEventEmitter = StrictEventEmitter<EventEmitter, {
  "changeLightMode": (mode: "color"|"temperature") => typeof mode;
}>

export class Remote extends BaseDevice<HomeyClass.remote> {
  protected eventEmitter: LightEventEmitter = new EventEmitter();

  public constructor(device: HomeyAPI.ManagerDevices.Device, homey: Device.Homey) {
    super(device, HomeyClass.remote, homey);
  }

  initialize(): void | Promise<void> {
    this.accessory.category = Categories.SWITCH;
    const services: Record<string, Service> = {};

    for(const { capabilityType, capabilityId, subType } of this.getCapabilitiesWithSubtypes()) {
      if(capabilityType === HomeyCapability.button) {
        const service = new Switch(subType || "Button", subType);
        const capability = new StatelessButtonCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));

        capability.initialize(service);
        this.addService(service);
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
