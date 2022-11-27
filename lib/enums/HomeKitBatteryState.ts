import * as characteristics from "hap-nodejs/dist/lib/definitions";


export enum HomeKitBatteryState {
  BATTERY_LEVEL_NORMAL = characteristics.StatusLowBattery.BATTERY_LEVEL_NORMAL,
  BATTERY_LEVEL_LOW = characteristics.StatusLowBattery.BATTERY_LEVEL_LOW
}
