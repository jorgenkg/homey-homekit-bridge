import { BaseCapability } from "./BaseCapability";
import { CarbonDioxideLevel } from "hap-nodejs/dist/lib/definitions";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";

export class CarbonDioxideCapability extends BaseCapability<HomeyCapability.measure_co2, CarbonDioxideLevel> {
  initialize(service: Service) {
    const characteristic: CarbonDioxideLevel = service
      .getCharacteristic(CarbonDioxideLevel)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .onGet(this.getCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
