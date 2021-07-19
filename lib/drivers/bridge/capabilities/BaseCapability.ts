import * as util from "util";
import { BaseDevice } from "../devices/BaseDevice";
import { EventEmitter } from "events";
import { HomeKitValueType } from "../../../@types/HomeKitValueType";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyCapabilityTypes } from "../../../@types/HomeyCapabilityTypes";
import { HomeyClass } from "../../../enums/HomeyClass";
import type {
  Characteristic, CharacteristicGetCallback, CharacteristicGetHandler, CharacteristicSetCallback, Nullable, Service
} from "hap-nodejs";
import type { Device } from "homey";
import type { HomeyAPI } from "athom-api";
import type StrictEventEmitter from "strict-event-emitter-types";

export abstract class BaseCapability<
  Capability extends HomeyCapability,
  CharacteristicType extends Characteristic | Array<Characteristic>,
  CharacteristicValue = HomeKitValueType<CharacteristicType>
> {
  public deviceClass: HomeyClass;

  protected device: HomeyAPI.ManagerDevices.Device;
  protected capabilityType: Capability;
  protected homey: Device.Homey;
  public capabilityId: string;
  public test!: CharacteristicValue;
  deferUpdate: BaseDevice<HomeyClass>["deferUpdate"];

  protected compabilityInstance: HomeyAPI.ManagerDevices.Device.CapabilityInstance;
  protected capabilityEmitter: StrictEventEmitter<EventEmitter, {
    change: (value: HomeyCapabilityTypes[Capability]) => Promise<void> | void
  }> = new EventEmitter();

  public constructor(
    deviceClass: HomeyClass,
    device: HomeyAPI.ManagerDevices.Device,
    homey: Device.Homey,
    capabilityType: Capability,
    capabilityId: string,
    deferUpdate: BaseDevice<HomeyClass>["deferUpdate"]
  ) {
    this.deviceClass = deviceClass;
    this.device = device;
    this.homey = homey;
    this.capabilityType = capabilityType;
    this.capabilityId = capabilityId;
    this.deferUpdate = deferUpdate;

    this.compabilityInstance = this.device.makeCapabilityInstance(
      this.capabilityId,
      () => this.capabilityEmitter.emit("change", this.getCapabilityValue())
    );
  }

  /** Create characteristic(s) from capability ID */
  abstract initialize(service?: Service): CharacteristicType

  getTransform(value: HomeyCapabilityTypes[Capability]): CharacteristicValue {
    return value as unknown as CharacteristicValue;
  }

  setTransform(value: CharacteristicValue): HomeyCapabilityTypes[Capability] {
    return value as unknown as HomeyCapabilityTypes[Capability];
  }

  getCapabilityValue(): HomeyCapabilityTypes[Capability] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.compabilityInstance.value;
  }

  setCapabilityValueOrFail<T extends CharacteristicValue = CharacteristicValue>() {
    return async(value: T) => {
      try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        await this.deferUpdate(this.capabilityId, value, () => this.compabilityInstance.setValue(this.setTransform(value)));
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.homey.log(`Updated Homey capability '${this.capabilityId}': ${value}`);
        return void 0;
      }
      catch(error) {
        this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
        return null;
      }
    };
  }

  getCapabilityValueOrFail() {
    return () => {
      try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = this.getCapabilityValue();
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.homey.log(`Fetched Homey capability value '${this.capabilityId}': ${value}`);

        return (value === null) ? value : this.getTransform(value);
      }
      catch(error) {
        this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
      }
      return null;
    };
  }

  registerCapabilityListenerOrFail(characteristic: Characteristic): void {
    this.capabilityEmitter.on("change", async value => {
      try {
        const oldHomekitValue = characteristic.value;
        await this.deferUpdate(this.capabilityId, value, async() => {
          await new Promise<void>(resolve => characteristic.updateValue(this.getTransform(value) as any, resolve));
        });
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.homey.log(`Homey value change on capabilityId '${this.capabilityId}' triggered update to HomeKit: ${oldHomekitValue} -> ${this.getTransform(value)}`);
      }
      catch(error) {
        this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
      }
    });
  }
}

