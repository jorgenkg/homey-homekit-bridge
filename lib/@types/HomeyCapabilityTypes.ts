export type HomeyCapabilityTypes = {
  onoff: boolean;
  dim: number;
  light_hue: number;
  light_saturation: number;
  light_temperature: number;
  light_mode: "color" | "temperature";
  vacuumcleaner_state: "cleaning" | "spot_cleaning" | "docked" | "charging" | "stopped";
  thermostat_mode: "auto" | "heat" | "cool" | "off";
  target_temperature: number;
  measure_temperature: number;
  measure_co: number;
  measure_co2: number;
  measure_pm25: number;
  measure_humidity: number;
  measure_pressure: number;
  measure_noise: number;
  measure_rain: number;
  measure_wind_strength: number;
  measure_wind_angle: number;
  measure_gust_strength: number;
  measure_gust_angle: number;
  measure_battery: number;
  measure_power: number;
  measure_voltage: number;
  measure_current: number;
  measure_luminance: number;
  measure_ultraviolet: number;
  measure_water: number;
  alarm_generic: boolean;
  alarm_motion: boolean;
  alarm_contact: boolean;
  alarm_co: boolean;
  alarm_co2: boolean;
  alarm_pm25: boolean;
  alarm_tamper: boolean;
  alarm_smoke: boolean;
  alarm_fire: boolean;
  alarm_heat: boolean;
  alarm_water: boolean;
  alarm_battery: boolean;
  alarm_night: boolean;
  meter_power: number;
  meter_water: number;
  meter_gas: number;
  meter_rain: number;
  homealarm_state: "partially_armed" | "armed" | "disarmed";
  volume_set: number;
  volume_up: boolean;
  volume_down: boolean;
  volume_mute: boolean;
  channel_up: boolean;
  channel_down: boolean;
  locked: boolean;
  lock_mode: "always_locked" | "always_unlocked" | "locked_until_unlock";
  windowcoverings_state: "up" | "idle" | "down";
  windowcoverings_tilt_up: boolean;
  windowcoverings_tilt_down: boolean;
  windowcoverings_tilt_set: number;
  windowcoverings_closed: boolean;
  windowcoverings_set: number;
  button: boolean;
  speaker_playing: boolean;
  speaker_next: boolean;
  speaker_prev: boolean;
  speaker_shuffle: boolean;
  speaker_repeat: "none" | "track" | "playlist";
  speaker_artist: string;
  speaker_album: string;
  speaker_track: string;
  speaker_duration: number;
  speaker_position: number;
};
