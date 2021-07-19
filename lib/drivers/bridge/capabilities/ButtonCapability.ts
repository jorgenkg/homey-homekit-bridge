import * as Characteristics from "hap-nodejs/dist/lib/definitions";
import * as util from "util";
import { BaseCapability } from "./BaseCapability";
import {
  CharacteristicEventTypes, CharacteristicGetCallback, CharacteristicSetCallback, Service
} from "hap-nodejs";
import { HomeyCapability } from "../../../enums/HomeyCapability";

export class StatelessButtonCapability extends BaseCapability<HomeyCapability.button, Characteristics.On, boolean> {
  private characteristic?: Characteristics.On;

  setCapabilityValueOrFail<T extends boolean = boolean>() {
    return async(value: T) => {
      try {
        await super.setCapabilityValueOrFail()(value);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.homey.log(`Updated Homey capability '${this.capabilityId}': ${value}`);

        setImmediate(async() => {
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.characteristic?.updateValue(false);
            this.homey.log(`Auto-switched stateless button for Homey capability '${this.capabilityId}' -> false`);
          }
          catch(error) {
            this.homey.error(`Failed to switch back stateless button: ${util.inspect(error)}`);
          }
        });
      }
      catch(error) {
        this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
        return null;
      }
    };
  }

  initialize(service: Service) {
    const characteristic: Characteristics.On = this.characteristic = service
      .getCharacteristic(Characteristics.On)
      .onGet(() => false)
      .onSet(this.setCapabilityValueOrFail<any>())
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
