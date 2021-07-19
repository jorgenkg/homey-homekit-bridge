import { BaseCapability } from "./BaseCapability";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { CurrentRelativeHumidity } from "hap-nodejs/dist/lib/definitions";
import { HomeyCapability } from "../../../enums/HomeyCapability";

export class HumidityCapability extends BaseCapability<HomeyCapability.measure_humidity, CurrentRelativeHumidity> {
  initialize(service: Service) {
    const characteristic: CurrentRelativeHumidity = service
      .getCharacteristic(CurrentRelativeHumidity)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .onGet(this.getCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
