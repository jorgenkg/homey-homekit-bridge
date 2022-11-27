import { BaseCapability } from "./BaseCapability";
import { BatteryLevel } from "hap-nodejs/dist/lib/definitions";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";


export class BatteryLevelCapability extends BaseCapability<HomeyCapability.measure_battery, BatteryLevel> {
  initialize(service: Service) {
    const characteristic: BatteryLevel = service
      .getCharacteristic(BatteryLevel)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .onGet(this.getCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
