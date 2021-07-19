import { BaseCapability } from "./BaseCapability";
import { Brightness, CurrentFanState, TargetFanState } from "hap-nodejs/dist/lib/definitions";
import {
  Characteristic, CharacteristicEventTypes, Service, Units
} from "hap-nodejs";
import { HomeKitValueType } from "../../../@types/HomeKitValueType";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyCapabilityTypes } from "../../../@types/HomeyCapabilityTypes";


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

export class DimFanCapability extends BaseCapability<HomeyCapability.dim, [CurrentFanState, TargetFanState], number> {
  getTransform(value: number) {
    return value * 100;
  }

  setTransform(value: number) {
    return value / 100;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  initialize(service: Service) {
    const current: CurrentFanState = service
      .getCharacteristic(Characteristic.CurrentFanState)
      .setProps({
        maxValue: 100,
        minValue: 0,
        minStep: 1,
        unit: Units.PERCENTAGE
      })
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .onGet(this.getCapabilityValueOrFail());

    const target: TargetFanState = service
      .getCharacteristic(TargetFanState)
      .setProps({
        maxValue: 100,
        minValue: 0,
        minStep: 1,
        unit: Units.PERCENTAGE
      })
      .onSet(this.setCapabilityValueOrFail() as any);

    this.registerCapabilityListenerOrFail(current);

    return [current, target] as [CurrentFanState, TargetFanState];
  }
}
