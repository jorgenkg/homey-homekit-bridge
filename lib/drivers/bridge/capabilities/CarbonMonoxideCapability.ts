import { BaseCapability } from "./BaseCapability";
import { CarbonMonoxideLevel } from "hap-nodejs/dist/lib/definitions";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";

export class CarbonMonoxideCapability extends BaseCapability<HomeyCapability.measure_co, CarbonMonoxideLevel> {
  initialize(service: Service) {
    const characteristic: CarbonMonoxideLevel = service
      .getCharacteristic(CarbonMonoxideLevel)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
