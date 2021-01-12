import { BaseCapability } from "./BaseCapability";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { MotionDetected } from "hap-nodejs/dist/lib/definitions";

export class MotionCapability extends BaseCapability<HomeyCapability.alarm_motion, MotionDetected> {
  initialize(service: Service) {
    const characteristic: MotionDetected = service
      .getCharacteristic(MotionDetected)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
