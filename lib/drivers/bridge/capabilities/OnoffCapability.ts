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
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail())
      .on(CharacteristicEventTypes.SET, this.setCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }

  async changeSwitchState(state: boolean) {
    this.compabilityInstance.setValue(state);
    await new Promise<void>(resolve => this.onoffCharacteristic?.updateValue(state, resolve));
  }
}
