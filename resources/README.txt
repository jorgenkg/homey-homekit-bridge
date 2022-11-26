Make Homey appear as a HomeKit bridge device and expose devices connected to Homey in HomeKit. 

Usage
1. Install Homey app
2. Open the Home app and "add device"
3. Add the bridge device using the pin `111-11-111`

How it works
The app process all devices connected to Homey and maps the devices over to HomeKit based on their "Device Class" in Homey.
Each device in Homey will be mapped according to its Device Class to a well known device type (called "Accessory") in HomeKit. 
By definition each Accessory in HomeKit support a preset list of Capabilities/properties. For instance "lights" supports On/off, dimming, hue, saturation and color temperature in HomeKit. This application will only consider the devices properties recognized by HomeKit for the specific Device Class.
Consequently, devices may expose some properties and controls in Homey that won't be made accessible in HomeKit since they might not be a part of the HomeKit standard.
