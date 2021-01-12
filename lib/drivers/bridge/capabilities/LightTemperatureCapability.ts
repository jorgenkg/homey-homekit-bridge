import { BaseCapability } from "./BaseCapability";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { ColorTemperature } from "hap-nodejs/dist/lib/definitions";
import { HomeyCapability } from "../../../enums/HomeyCapability";

export class LightTemperatureCapability extends BaseCapability<HomeyCapability.light_temperature, ColorTemperature> {
  public characteristic?: ColorTemperature;

  getTransform(value: number): number {
    return this.map(140, 500, 0, 1, value);
  }

  setTransform(value: number): number {
    return this.map(0, 1, 140, 500, value) || 500;
  }

  map(inputStart: number, inputEnd: number, outputStart: number, outputEnd: number, input: number): number {
    return outputStart + ((outputEnd - outputStart) / (inputEnd - inputStart)) * (input - inputStart);
  }

  initialize(service: Service) {
    const characteristic: ColorTemperature = this.characteristic = service
      .getCharacteristic(ColorTemperature)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail())
      .on(CharacteristicEventTypes.SET, this.setCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
