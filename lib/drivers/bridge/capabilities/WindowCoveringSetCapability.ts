import { BaseCapability } from "./BaseCapability";
import { CurrentPosition, PositionState, TargetPosition } from "hap-nodejs/dist/lib/definitions";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyCapabilityTypes } from "../../../@types/HomeyCapabilityTypes";
import { Service, Units } from "hap-nodejs";

export class WindowCoveringSetCapability extends BaseCapability<HomeyCapability.windowcoverings_set, [CurrentPosition, TargetPosition, PositionState], number> {
  initialize(service: Service) {
    const currentPosition: CurrentPosition = service
      .getCharacteristic(CurrentPosition)
      .setProps({
        maxValue: 100,
        minValue: 0,
        minStep: 1,
        unit: Units.PERCENTAGE
      })
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .onGet(this.getCapabilityValueOrFail());

    const targetPosition: TargetPosition = service
      .getCharacteristic(TargetPosition)
      .setProps({
        maxValue: 100,
        minValue: 0,
        minStep: 1,
        unit: Units.PERCENTAGE
      })
      .onSet(this.setCapabilityValueOrFail() as any);

    this.registerCapabilityListenerOrFail(targetPosition);

    const positionState: PositionState = service
      .getCharacteristic(PositionState)
      .updateValue(PositionState.STOPPED);

    return [currentPosition, targetPosition, positionState] as [CurrentPosition, TargetPosition, PositionState];
  }

  getTransform(value: number) {
    return Math.ceil(value * 100);
  }

  setTransform(value: number) {
    return value / 100;
  }
}
