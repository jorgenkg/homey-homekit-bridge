Make Homey appear as a HomeKit bridge device and expose devices connected to Homey in HomeKit. 

Usage
1. Install Homey app
2. Open the Home app and "add device"
3. Add the bridge device using the pin `111-11-111`

How it works
The app process all devices connected to Homey and maps the devices over to HomeKit based on their "Device Class" in Homey.
By definition each Device Class support a preset list of Capabilities/properties. For instance the Device Class "light" supports On/off, dimming, hue, saturation and color temperature. This application will only consider the device class properties formalized in the Homey standard.
For each device in Homey, the application will map its Device Class to a well known device type (called "Accessory") in the HomeKit standard. 
Consequently, devices may expose some properties and controllers in Homey that won't be made accessible in HomeKit since they might not be a part of the HomeKit standard.
