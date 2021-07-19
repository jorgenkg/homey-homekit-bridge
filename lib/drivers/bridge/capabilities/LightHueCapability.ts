import { BaseCapability } from "./BaseCapability";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { Hue } from "hap-nodejs/dist/lib/definitions";

export class LightHueCapability extends BaseCapability<HomeyCapability.light_hue, Hue> {
  public characteristic?: Hue;

  getTransform(value: number): number {
    return value * 360;
  }

  setTransform(value: number): number {
    return value / 360;
  }

  initialize(service: Service) {
    const characteristic: Hue = this.characteristic = service
      .getCharacteristic(Hue)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .onGet(this.getCapabilityValueOrFail())
      .onSet(this.setCapabilityValueOrFail<any>());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
