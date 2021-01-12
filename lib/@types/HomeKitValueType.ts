import * as characteristics from "hap-nodejs/dist/lib/definitions";
import { HomeKitTamperedState } from "../enums/HomeKitTamperedState";
import { ProgrammableSwitchEventState } from "../enums/ProgrammableSwitchEventState";
import { SupportedHomeKitAlarmStates } from "../enums/SupportedHomeKitAlarmStates";

export type HomeKitValueType<T> = T extends characteristics.ProgrammableSwitchEvent ? ProgrammableSwitchEventState : T extends characteristics.StatusTampered ? HomeKitTamperedState : T extends characteristics.Brightness ? number : T extends characteristics.CurrentFanState ? number : T extends characteristics.TargetFanState ? number : T extends characteristics.SecuritySystemTargetState ? SupportedHomeKitAlarmStates : T extends characteristics.Hue ? number : T extends characteristics.Saturation ? number : T extends characteristics.ColorTemperature ? number : T extends characteristics.On ? boolean : never;
