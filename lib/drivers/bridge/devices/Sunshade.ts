import { BaseDevice } from "./BaseDevice";
import { Categories } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyClass } from "../../../enums/HomeyClass";
import { PositionState, WindowCovering } from "hap-nodejs/dist/lib/definitions";
import { WindowCoveringSetCapability } from "../capabilities/WindowCoveringSetCapability";
import type { Device } from "homey";
import type { HomeyAPI } from "athom-api";

export class Sunshade extends BaseDevice<HomeyClass.sunshade> {
  private previousValue?: number;

  public constructor(device: HomeyAPI.ManagerDevices.Device, homey: Device.Homey) {
    super(device, HomeyClass.sunshade, homey);
  }

  public initialize(): void {
    this.accessory.category = Categories.WINDOW_COVERING;

    for(const { capabilityType, capabilityId, subType } of this.getCapabilitiesWithSubtypes()) {
      if(capabilityType === HomeyCapability.windowcoverings_set) {
        const windowcoveringsSetInstance = this.device.makeCapabilityInstance(capabilityId, () => void 0);

        this.previousValue = windowcoveringsSetInstance.value as number;


        const name = this.device.name + (subType ? ` (${subType})` : "");
        const service = new WindowCovering(name, subType);
        const capability = new WindowCoveringSetCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));

        const [,, position] = capability.initialize(service);

        this.addService(service);

        this.device.makeCapabilityInstance(capabilityId, (newValue: number) => {
          if(this.previousValue) {
            if(newValue > this.previousValue) {
              position.updateValue(PositionState.INCREASING);
            }
            else if(newValue < this.previousValue) {
              position.updateValue(PositionState.DECREASING);
            }
          }

          this.homey.setTimeout(() => {
            position.updateValue(PositionState.STOPPED);
          }, 10000);
        });
      }
      else {
        this.homey.error(`Unsupported capability on device ${this.device.id}: ${capabilityType} from capabilityId '${capabilityId}'`);
      }
    }
  }
}
