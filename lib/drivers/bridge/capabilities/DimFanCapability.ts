import { BaseCapability } from "./BaseCapability";
import { Characteristic, Service, Units } from "hap-nodejs";
import { CurrentFanState, TargetFanState } from "hap-nodejs/dist/lib/definitions";
import { HomeyCapability } from "../../../enums/HomeyCapability";

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
