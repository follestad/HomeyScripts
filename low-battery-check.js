/*
 * Check if the battery is low
 */

// Set the battery level to check for. Battery lower than given arg will be reported
const THRESHOLD = typeof args[0] === 'string' && !isNaN(args[0]) ? parseInt(args[0]) : 70;

// Store list of device names that is offline
const low_battery_devices = [];

// Reset tag
await tag('Low Battery List', null);

// Keep count
let count = 0;

// Loop over all devices
for (const device of Object.values(await Homey.devices.getDevices())) {

    // If this device isn't available, skip it.
    if (!device.capabilitiesObj) continue;

    for (const capability of Object.values(device.capabilitiesObj)) {

        // Skip if capability isn't temperature
        if (capability.id !== 'measure_battery') continue;

        count++;

        if (capability.value < THRESHOLD) {
            low_battery_devices.push(`${device.name} (${capability.value}%)`);
        }

    }

}

// Return false if no devices is registered as offline
if (low_battery_devices.length === 0) {
    log(`All ${count} battery driven units has at least ${THRESHOLD}% battery`);
    return false;
}

let device_list = low_battery_devices.join(', ');
message = `${device_list} has battery lower than ${THRESHOLD}%`;
await tag('Low Battery List', message);

log(`${message}`);
return true;