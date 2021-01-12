# Homey HomeKit Bridge

Make Homey appear as a HomeKit bridge device and expose devices connected to Homey in HomeKit. 

The project is written in Typescript and transpiled into a Homey compliant app in `/build`.

Kudos to [HAP-NodeJS](https://github.com/homebridge/HAP-NodeJS) for the HomeKit integration.

# Usage

1. Install Homey app
2. Open the Home app and "add device"
3. Add the bridge device using the pin `111-11-111`

# Limitations

This app support only a subset of Homey device classes:
1. Light (on/off, dim, hue, saturation, temperature)
2. Home alarm (alarm state and tamper detection)
3. Button (stateless buttons)

# Upcoming Homey device classes

1. `sensor`