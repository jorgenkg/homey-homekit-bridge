import { BaseCapability } from "./BaseCapability";
import {
  Characteristic, CharacteristicEventTypes, Formats, Perms, Service
} from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyCapabilityTypes } from "../../../@types/HomeyCapabilityTypes";
import { SecuritySystemCurrentState, SecuritySystemTargetState } from "hap-nodejs/dist/lib/definitions";
import { SupportedHomeKitAlarmStates } from "../../../enums/SupportedHomeKitAlarmStates";


export class HomeAlarmCapability extends BaseCapability<HomeyCapability.homealarm_state, [SecuritySystemCurrentState, SecuritySystemTargetState], SupportedHomeKitAlarmStates> {
  getTransform(value: HomeyCapabilityTypes[HomeyCapability.homealarm_state]) {
    if(value === "armed") {
      return SupportedHomeKitAlarmStates.AWAY_ARM;
    }
    else if(value === "disarmed") {
      return SupportedHomeKitAlarmStates.DISARMED;
    }
    else if(value === "partially_armed") {
      return SupportedHomeKitAlarmStates.NIGHT_ARM;
    }
    else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unsupported alarm state: ${value}`);
    }
  }

  setTransform(homekitState: SupportedHomeKitAlarmStates) {
    if(homekitState === SupportedHomeKitAlarmStates.AWAY_ARM) {
      return "armed";
    }
    else if(homekitState === SupportedHomeKitAlarmStates.NIGHT_ARM) {
      return "partially_armed";
    }
    else if(homekitState === SupportedHomeKitAlarmStates.DISARMED) {
      return "disarmed";
    }
    else {
      throw new Error(`Unsupported alarm state: ${homekitState}`);
    }
  }

  initialize(service: Service) {
    const current: SecuritySystemCurrentState = service
      .getCharacteristic(SecuritySystemCurrentState)
      .setProps({
        validValues: [
          SupportedHomeKitAlarmStates.AWAY_ARM,
          SupportedHomeKitAlarmStates.NIGHT_ARM,
          SupportedHomeKitAlarmStates.DISARMED
        ]
      })
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail());

    const target: SecuritySystemTargetState = service
      .getCharacteristic(SecuritySystemTargetState)
      .setProps({
        validValues: [
          SupportedHomeKitAlarmStates.AWAY_ARM,
          SupportedHomeKitAlarmStates.NIGHT_ARM,
          SupportedHomeKitAlarmStates.DISARMED
        ]
      })
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .on(CharacteristicEventTypes.GET, this.getCapabilityValueOrFail())
      .on(CharacteristicEventTypes.SET, this.setCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(current);

    return [current, target] as [SecuritySystemCurrentState, SecuritySystemTargetState];
  }
}
