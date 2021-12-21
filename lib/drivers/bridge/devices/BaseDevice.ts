import {
  Accessory, AccessoryEventTypes, Characteristic, Service, uuid
} from "hap-nodejs";
import { EventEmitter } from "events";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyClass } from "../../../enums/HomeyClass";
import type { Device } from "homey";
import type { HomeyAPI } from "athom-api";
import type StrictEventEmitter from "strict-event-emitter-types";

const DEFER_MS = 200;

const enum DeferEvent {
  deferExecuted = "deferExecuted"
}

type DeferEmitter = StrictEventEmitter<EventEmitter, {
  [DeferEvent.deferExecuted]: (error?: Error) => void;
}>

export abstract class BaseDevice<DeviceClass extends HomeyClass> {
  [x: string]: any;
  public deviceClass: DeviceClass;

  protected device: HomeyAPI.ManagerDevices.Device;

  protected deferEmitter: DeferEmitter = new EventEmitter();

  protected deferredTriggers: {
    [capabilityId: string]: {
      value: unknown,
      fn: () => Promise<void> | void
    }
  } = {};

  protected deferHandler: ReturnType<Device.Homey["setTimeout"]> | null = null;
  protected deferrerExecuting = false;

  protected accessory: Accessory;

  protected homey: Device.Homey;

  protected constructor(
    device: HomeyAPI.ManagerDevices.Device,
    deviceClass: DeviceClass,
    homey: Device.Homey
  ) {

    this.deviceClass = deviceClass;
    this.device = device;
    this.homey = homey;

    this.accessory = new Accessory(this.device.name, uuid.generate(this.device.id));

    (this.accessory.getService(Service.AccessoryInformation) || this.accessory.addService(Service.AccessoryInformation))
      .setCharacteristic(Characteristic.Manufacturer, this.device.driverId)
      .setCharacteristic(Characteristic.Model, this.device.driverId + "(via Homey)");

    this.accessory.on(AccessoryEventTypes.IDENTIFY, (_paired, callback) => callback());

    this.initialize();
  }

  protected getCapabilitiesWithSubtypes(): Array<{capabilityType: HomeyCapability, capabilityId: string, subType?: string}> {
    return this.device.capabilities
      .map(capabilityId => {
        const [prefix, ...subTypeParts] = capabilityId.split(".");
        const subType = subTypeParts.length > 0 ? subTypeParts.join(".") : undefined;
        return {
          capabilityId,
          capabilityType: prefix as unknown as HomeyCapability,
          subType
        };
      });

  }

  protected addService(service: Service): void {
    this.accessory.addService(service);
  }

  protected async deferUpdate(capabilityId: string, value: unknown, deferredFn: () => Promise<void> | void): Promise<void> {
    if(this.deferrerExecuting) {
      await new Promise<void>((resolve, reject) => this.deferEmitter.once(DeferEvent.deferExecuted, error => error ? reject(error) : resolve()));
    }
    else if(this.deferHandler) {
      // Bump the deferring
      this.homey.clearTimeout(this.deferHandler);
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.homey.log(`Deferring updates due to changes to ${capabilityId}`);

    this.deferredTriggers[capabilityId] = { value, fn: deferredFn };

    const promiseDeferExecution = new Promise<void>((resolve, reject) => this.deferEmitter.once(DeferEvent.deferExecuted, error => error ? reject(error) : resolve()));

    this.deferHandler = this.homey.setTimeout(async() => {
      try {
        this.homey.log("Executing deferHandler");
        this.deferrerExecuting = true;

        await this.processDeferredUpdate(this.deferredTriggers);
        this.deferredTriggers = {};
        this.deferrerExecuting = false;
        this.deferEmitter.emit(DeferEvent.deferExecuted);
      }
      catch(error) {
        this.deferEmitter.emit(DeferEvent.deferExecuted, error as Error);
      }
    }, DEFER_MS);

    await promiseDeferExecution;
  }

  async processDeferredUpdate(triggered: Readonly<BaseDevice<DeviceClass>["deferredTriggers"]>) {
    for(const [id, { value, fn }] of Object.entries(this.deferredTriggers)) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.homey.log(`Triggering deferred update for capabilityId ${id}`);
      await fn();
    }
  }

  abstract initialize(): void

  public getAccessory(): Accessory {
    return this.accessory;
  }

  public getDevice(): HomeyAPI.ManagerDevices.Device {
    return this.device;
  }
}

