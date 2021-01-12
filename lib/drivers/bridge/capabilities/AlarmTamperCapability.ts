import { BaseCapability } from "./BaseCapability";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeKitTamperedState } from "../../../enums/HomeKitTamperedState";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { StatusTampered } from "hap-nodejs/dist/lib/definitions";

export class AlarmTamperCapability extends BaseCapability<HomeyCapability.alarm_tamper, StatusTampered, HomeKitTamperedState> {
  getTransform(value: boolean) {
    if(value) {
      return HomeKitTamperedState.TAMPERED;
    }
    else {
      return HomeKitTamperedState.NOT_TAMPERED;
    }
  }

  initialize(service: Service) {
    const characteristic: StatusTampered = service
      .getCharacteristic(StatusTampered)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
