/*
 * A simple script to check if temperature sensors is offline.
 *
 * Some sensors might be stuck on the last registered temperature if it goes
 * offline, which migh create some issues if you're trying to regulate the
 * temperature in your home.
 * 
 * Create a flow with this script to send you a notification if any sensor
 * has been offline for a given amount of time.
 */


// Make sure argument is provided, else default to 8 hours
const hours = typeof args[0] === 'string' && !isNaN(args[0]) ? parseInt(args[0]) : 8;

// Store list of device names that is offline
const sensors = [];

// Remove tag if set
await tag('Temperature Device Offline', null);

// Count sensors that is checked
let count = 0;

// Loop over all devices
for (const device of Object.values(await Homey.devices.getDevices())) {

    // If this device isn't available, skip it.
    if (!device.capabilitiesObj) continue;

    // If this device isn't a sensor or thermostat, skip it.
    if (device.class !== 'sensor' && device.class !== 'thermostat') continue;

    // Example of device we do not want to check.
    // Copy this line and add the name of devices to ignore
    if( device.name === 'Weather') continue;

    for (const capability of Object.values(device.capabilitiesObj)) {

        // Skip if capability isn't temperature
        if( ! capability.title.toLowerCase().includes('temperature') ) continue;

        // Exampel of capabilities we want to ignore.
        if( capability.title === 'external temperature') continue;
        if( capability.title === 'Target temperature') continue;

        // Make sure lastUpdated value is available
        if (!capability.lastUpdated) continue;

        count++;

        // Check if device hasn't been updated according to set numeric argument
        if ((Date.now() - new Date(capability.lastUpdated)) > ((hours * 3600) * 1000)) {
            sensors.push(`${device.name} - ${capability.title}`);
            log( `${device.name} last updated: ${capability.lastUpdated}` )
        }

    }

}

// Return false if no devices is registered as offline
if (sensors.length === 0) {
    log(`All ${count} temperature sensors has been updated the last ${hours} hours`);
    return false;
}

// Create tag for devices that hasn't been updated
await tag('Temperature Device Offline', `${sensors.join(', ')} hasn't been updated in ${hours} hours`);
log(`${sensors.join(', ')} hasn't been updated in ${hours} hours`)

return true;