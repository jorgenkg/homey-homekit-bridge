import { BaseCapability } from "./BaseCapability";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { Saturation } from "hap-nodejs/dist/lib/definitions";

export class LightSaturationCapability extends BaseCapability<HomeyCapability.light_saturation, Saturation> {
  public characteristic?: Saturation;

  getTransform(value: number): number {
    return value * 100;
  }

  setTransform(value: number): number {
    return value / 100;
  }

  initialize(service: Service) {
    const characteristic: Saturation = this.characteristic = service
      .getCharacteristic(Saturation)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail())
      .on(CharacteristicEventTypes.SET, this.setCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
