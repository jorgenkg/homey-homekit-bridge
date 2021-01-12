import { BaseCapability } from "./BaseCapability";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { PM2_5Density } from "hap-nodejs/dist/lib/definitions";


export class Pm25Capability extends BaseCapability<HomeyCapability.measure_pm25, PM2_5Density> {
  initialize(service: Service) {
    const characteristic: PM2_5Density = service
      .getCharacteristic(PM2_5Density)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
