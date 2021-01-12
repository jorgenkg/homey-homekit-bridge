import { BaseDevice } from "./BaseDevice";
import { Categories } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyClass } from "../../../enums/HomeyClass";
import { StatelessButtonCapability } from "../capabilities";
import { Switch } from "hap-nodejs/dist/lib/definitions";
import type { Device } from "homey";
import type { HomeyAPI } from "athom-api";

export class Button extends BaseDevice<HomeyClass.button> {
  public constructor(device: HomeyAPI.ManagerDevices.Device, homey: Device.Homey) {
    super(device, HomeyClass.button, homey);
  }

  public initialize(): void | Promise<void> {
    this.accessory.category = Categories.SWITCH;

    for(const { capabilityType, capabilityId, subType } of this.getCapabilitiesWithSubtypes()) {
      if(capabilityType === HomeyCapability.button) {
        const service = new Switch("Button", subType);
        const capability = new StatelessButtonCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));

        capability.initialize(service);
        this.addService(service);
      }
      else {
        this.homey.error(`Unsupported capability on device ${this.device.id}: ${capabilityType} from capabilityId '${capabilityId}'`);
      }
    }
  }
}
