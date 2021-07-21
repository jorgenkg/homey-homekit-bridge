import { BaseCapability } from "./BaseCapability";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { On } from "hap-nodejs/dist/lib/definitions";

export class OnoffCapability extends BaseCapability<HomeyCapability.onoff, On> {
  private onoffCharacteristic?: On;

  initialize(service: Service) {

    const characteristic: On = this.onoffCharacteristic = service
      .getCharacteristic(On)
      .updateValue(this.getCapabilityValue())
      .onGet(this.getCapabilityValueOrFail())
      .onSet(this.setCapabilityValueOrFail<any>());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }

  changeSwitchState(state: boolean) {
    this.capabilityInstance.setValue(state);
    this.onoffCharacteristic?.updateValue(state);
  }
}
