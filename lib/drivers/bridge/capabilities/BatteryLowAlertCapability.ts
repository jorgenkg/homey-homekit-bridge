import { BaseCapability } from "./BaseCapability";
import { CharacteristicEventTypes, Service } from "hap-nodejs";
import { HomeKitBatteryState } from "../../../enums/HomeKitBatteryState";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { StatusLowBattery } from "hap-nodejs/dist/lib/definitions";


export class BatteryLowAlertCapability extends BaseCapability<HomeyCapability.alarm_battery, StatusLowBattery, HomeKitBatteryState> {
  getTransform(value: boolean) {
    if(value) {
      return HomeKitBatteryState.BATTERY_LEVEL_LOW;
    }
    else {
      return HomeKitBatteryState.BATTERY_LEVEL_NORMAL;
    }
  }

  initialize(service: Service) {
    const characteristic: StatusLowBattery = service
      .getCharacteristic(StatusLowBattery)
      .updateValue(this.getTransform(this.getCapabilityValue()))
      .onGet(this.getCapabilityValueOrFail());

    this.registerCapabilityListenerOrFail(characteristic);

    return characteristic;
  }
}
