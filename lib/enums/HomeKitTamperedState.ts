import * as characteristics from "hap-nodejs/dist/lib/definitions";


export enum HomeKitTamperedState {
  NOT_TAMPERED = characteristics.StatusTampered.NOT_TAMPERED,
  TAMPERED = characteristics.StatusTampered.TAMPERED
}
