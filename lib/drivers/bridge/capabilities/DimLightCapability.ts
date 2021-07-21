import { BaseCapability } from "./BaseCapability";
import { Brightness } from "hap-nodejs/dist/lib/definitions";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { Service, Units } from "hap-nodejs";

export class DimLightCapability extends BaseCapability<HomeyCapability.dim, Brightness> {
  getTransform(value: number) {
    return value * 100;
  }

  setTransform(value: number) {
    return value / 100;
  }

  initialize(service: Service) {
    const characteristic: Brightness = service
      .getCharacteristic(Brightness)
      .setProps({
        maxValue: 100,
        minValue: 0,
        minStep: 1,
        unit: Units.PERCENTAGE
      })
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .onGet(this.getCapabilityValueOrFail())
      .onSet(this.setCapabilityValueOrFail<any>());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
