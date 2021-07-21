import * as util from "util";
import {
  AdaptiveLightingController,
  AdaptiveLightingControllerMode,
  Categories, CharacteristicEventTypes, CharacteristicSetCallback, Service
} from "hap-nodejs";
import { BaseDevice } from "./BaseDevice";
import { Brightness, ColorTemperature, Lightbulb } from "hap-nodejs/dist/lib/definitions";
import { DimLightCapability } from "../capabilities/DimLightCapability";
import { EventEmitter } from "events";
import { HomeyCapability } from "../../../enums/HomeyCapability";
import { HomeyClass } from "../../../enums/HomeyClass";
import { LightHueCapability } from "../capabilities/LightHueCapability";
import { LightSaturationCapability } from "../capabilities/LightSaturationCapability";
import { LightTemperatureCapability } from "../capabilities/LightTemperatureCapability";
import { OnoffCapability } from "../capabilities/OnoffCapability";
import type { Device } from "homey";
import type { HomeyAPI } from "athom-api";
import type StrictEventEmitter from "strict-event-emitter-types";

type LightEventEmitter = StrictEventEmitter<EventEmitter, {
  "changeLightMode": (mode: "color"|"temperature") => typeof mode;
  "dimmedToZero": () => void; // used to trigger onoff state change
}>


export class Light extends BaseDevice<HomeyClass.light> {
  protected eventEmitter: LightEventEmitter = new EventEmitter();

  private onoffCapability?: OnoffCapability;

  public constructor(device: HomeyAPI.ManagerDevices.Device, homey: Device.Homey) {
    super(device, HomeyClass.light, homey);
  }

  initialize(): void {
    this.accessory.category = Categories.LIGHTBULB;
    const services: Record<string, Lightbulb> = {};
    const hasBrightness = new Set<Lightbulb>();
    const hasColorTemperature = new Set<Lightbulb>();

    for(const { capabilityId, subType = "", capabilityType } of this.getCapabilitiesWithSubtypes()) {
      if(!(subType in services)) {
        const name = this.device.name + (subType ? ` (${subType})` : "");
        services[subType] = new Lightbulb(name, subType);
      }

      if(capabilityType === HomeyCapability.dim) {
        const capability = new DimLightCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(services[subType]);
        hasBrightness.add(services[subType]);
        this.homey.log(`Device ${this.device.id} initialized ${capabilityType} from capabilityId '${capabilityId}'`);
      }
      else if(capabilityType === HomeyCapability.onoff) {
        const capability = this.onoffCapability = new OnoffCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(services[subType]);
        this.homey.log(`Device ${this.device.id} initialized ${capabilityType} from capabilityId '${capabilityId}'`);
      }
      else if(capabilityType === HomeyCapability.light_hue) {
        const capability = new LightHueCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(services[subType]);
        capability.characteristic?.onSet(() => {
          try {
            this.eventEmitter.emit("changeLightMode", "color");
          }
          catch(error) {
            this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
          }
        });
        this.homey.log(`Device ${this.device.id} initialized ${capabilityType} from capabilityId '${capabilityId}'`);
      }
      else if(capabilityType === HomeyCapability.light_saturation) {
        const capability = new LightSaturationCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(services[subType]);
        capability.characteristic?.onSet(() => {
          try {
            this.eventEmitter.emit("changeLightMode", "color");
          }
          catch(error) {
            this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
          }
        });
        this.homey.log(`Device ${this.device.id} initialized ${capabilityType} from capabilityId '${capabilityId}'`);
      }
      else if(capabilityType === HomeyCapability.light_temperature) {
        const capability = new LightTemperatureCapability(this.deviceClass, this.device, this.homey, capabilityType, capabilityId, this.deferUpdate.bind(this));
        capability.initialize(services[subType]);
        hasColorTemperature.add(services[subType]);
        capability.characteristic?.onSet(() => {
          try {
            this.eventEmitter.emit("changeLightMode", "temperature");
          }
          catch(error) {
            this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
          }
        });
        this.homey.log(`Device ${this.device.id} initialized ${capabilityType} from capabilityId '${capabilityId}'`);
      }
      else if(capabilityType === HomeyCapability.light_mode) {
        const transientCapabilityInstance = this.device.makeCapabilityInstance(capabilityId, () => void 0);

        this.eventEmitter.on("changeLightMode", async mode => {
          try {
            await this.deferUpdate(capabilityId, mode, () => transientCapabilityInstance.setValue(mode));
          }
          catch(error) {
            this.homey.error(util.inspect(error, { breakLength: Infinity, depth: null }));
          }
        });
        this.homey.log(`Device ${this.device.id} initialized ${capabilityType} from capabilityId '${capabilityId}'`);
      }
      else {
        this.homey.log(`Unsupported capability on device ${this.device.id}: ${capabilityType} from capabilityId '${capabilityId}'`);
      }
    }

    for(const service of Object.values(services)) {
      this.addService(service);
    }

    for(const lightbulb of Object.values(services)) {
      // The lightbulb supports "HomeKit Adaptive lighting" if it has both the Brightness and Color temperature characteristics.
      if(hasBrightness.has(lightbulb) && hasColorTemperature.has(lightbulb)) {
        const adaptiveLightingController = new AdaptiveLightingController(lightbulb, { controllerMode: AdaptiveLightingControllerMode.AUTOMATIC });
        this.accessory.configureController(adaptiveLightingController);
      }
    }
  }

  async processDeferredUpdate(triggered: Readonly<BaseDevice<HomeyClass.light>["deferredTriggers"]>) {
    const { onoffCapability } = this;

    if(
      // If the dim level is set to 0, the onoff value must be 'false' if the onoff characteristic is set.
      HomeyCapability.dim in triggered &&
      triggered[HomeyCapability.dim].value === 0 &&
      onoffCapability !== undefined &&
      // boolean whether the light is turned on.
      // If the dim value is 0, the lamp should be off
      onoffCapability.getCapabilityValue()
    ) {
      this.deferredTriggers[onoffCapability.capabilityId] = {
        value: false,
        fn: () => onoffCapability.changeSwitchState(false)
      };
    }

    if(
      // The dim is set to > 0, the onoff value must be 'true' if the characteristic is set.
      HomeyCapability.dim in triggered &&
      triggered[HomeyCapability.dim].value as number > 0 &&
      onoffCapability !== undefined &&
      // boolean whether the light is turned on
      // If the dim value is > 0, the lamp should be on
      !onoffCapability.getCapabilityValue()
    ) {
      this.deferredTriggers[onoffCapability.capabilityId] = {
        value: true,
        fn: () => onoffCapability.changeSwitchState(true)
      };
    }

    // Always dim before changing onoff status
    const sortOrder: Record<string, number> = {
      [HomeyCapability.dim]: -2,
      [HomeyCapability.onoff]: -1,
    };

    const executeTriggers = Object.entries(this.deferredTriggers);

    executeTriggers.sort(([A], [B]) => {
      const [capabilityTypeA] = A.split(".");
      const [capabilityTypeB] = B.split(".");

      return (sortOrder[capabilityTypeA] ?? 0) - (sortOrder[capabilityTypeB] ?? 0);
    });

    for(const [id, { fn }] of executeTriggers) {
      this.homey.log(`Triggering deferred update for capabilityId ${id}`);
      await fn();
    }

  }
}
