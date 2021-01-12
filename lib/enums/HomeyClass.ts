export enum HomeyClass {
  /** Use this device class for audio amplifier devices. */
  amplifier = "amplifier",
  /** Use this device class for blinds, both horizontal and vertical. */
  blinds = "blinds",
  /** Use this device class for buttons, such as a remote. */
  button = "button",
  /** Security camera  */
  camera = "camera",
  /** Use this device class for coffee machines. */
  coffeemachine = "coffeemachine",
  /** Use this device class for curtains. */
  curtain = "curtain",
  /** Use this device class for doorbells, usually together with the `button` capability. */
  doorbell = "doorbell",
  /** Use this device class for fans that cool your home. */
  fan = "fan",
  /** Use this device class for heaters, that warm your home. */
  heater = "heater",
  /** Use this device class for home alarm systems. */
  homealarm = "homealarm",
  /** Use this device class for kettle devices, that can heat water. */
  kettle = "kettle",
  /** Use this device class for lights, usually together with the `onoff`, `dim` and `light_*` capabilities. */
  light = "light",
  /** Use this device class for lock devices, usually together with the `locked` and `lock_mode` capabilities. */
  lock = "lock",
  /** Use this device class for devices that do not fit any other device class. */
  other = "other",
  /** Use this device class for (TV/Sunblind/Keyfob etc.) remotes. */
  remote = "remote",
  /** Use this device class for sensors, e.g. a contact or motion sensor. */
  sensor = "sensor",
  /** Use this device class for sockets (built-in or plug-in socket switches). When adding the `choose_slave` pair template, the user is presented a `What's plugged in?` question. */
  socket = "socket",
  /** Use this device class for devices that can play music, usually together with the `speaker_*` capabilities. */
  speaker = "speaker",
  /** Use this device class for solar panels. */
  solarpanel = "solarpanel",
  /** Use this device class for sunshades (window coverings against the sun).  */
  sunshade = "sunshade",
  /** Use this device class for thermostats, either for the entire home or radiator-mounted, usually together with the `measure_temperature`, `target_temperature` and `thermostat_mode` capabilities. */
  thermostat = "thermostat",
  /** Use this device class for TVs. */
  tv = "tv",
  /** Use this device class for vacuum cleaners, usually together with the `vacuumcleaner_state` capability. */
  vacuumcleaner = "vacuumcleaner",
  /** Use this device class for window coverings, when the `curtains`, `blinds` or `sunshade` device class doesn't apply. */
  windowcoverings = "windowcoverings"
}
