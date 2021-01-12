import { Accessory, CharacteristicEventTypes, Service } from "hap-nodejs";
import { BaseCapability } from "./BaseCapability";
import { CurrentTemperature } from "hap-nodejs/dist/lib/definitions";
import { HomeyCapability } from "../../../enums/HomeyCapability";

export class TemperatureCapability extends BaseCapability<HomeyCapability.measure_temperature, CurrentTemperature> {
  initialize(service: Service) {
    const characteristic: CurrentTemperature = service
      .getCharacteristic(CurrentTemperature)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
