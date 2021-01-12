import * as Characteristics from "hap-nodejs/dist/lib/definitions";
import * as util from "util";
import { BaseCapability } from "./BaseCapability";
import {
  CharacteristicEventTypes, CharacteristicGetCallback, CharacteristicSetCallback, Service
} from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";

export class StatelessButtonCapability extends BaseCapability<HomeyCapability.button, Characteristics.On> {
  private characteristic?: Characteristics.On;

  setCapabilityValueOrFail(): (value: any, callback: CharacteristicSetCallback) => Promise<void> {
    return async(value: boolean, callback: CharacteristicSetCallback): Promise<void> => {
      try {
        await super.setCapabilityValueOrFail()(value, callback);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.homey.log(`Updated Homey capability '${this.capabilityId}': ${value}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.characteristic?.updateValue(false);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.homey.log(`Updated Homey capability '${this.capabilityId}': ${false}`);
      }
      catch(error) {
        this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
        callback();
      }
    };
  }

  initialize(service: Service) {
    const characteristic: Characteristics.On = this.characteristic = service
      .getCharacteristic(Characteristics.On)
      .on(CharacteristicEventTypes.GET, callback => {
        callback(null, false);
      })
      .on(CharacteristicEventTypes.SET, this.setCapabilityValueOrFail())
      .updateValue(false);

    this.capabilityEmitter.on("change", async value => {
      try {
        const oldHomekitValue = characteristic.value;
        await new Promise<void>(resolve =>
          this.deferUpdate(this.capabilityId, value, async() => {
            characteristic.updateValue(this.getTransform(value) as any);
            resolve();
            await new Promise(resolveTimeout => setTimeout(resolveTimeout, 1000));
            this.characteristic?.updateValue(false);
          })
        );
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.homey.log(`Homey value change on capabilityId '${this.capabilityId}' triggered update to HomeKit: ${oldHomekitValue} -> ${this.getTransform(value)}`);
      }
      catch(error) {
        this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
      }
    });

    return characteristic;
  }
}
