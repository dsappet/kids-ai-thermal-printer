const usb = require("usb");
import { findByIds, findBySerialNumber, WebUSBDevice } from "usb";

// List all USB devices
export function listUsbDevices() {
  const devices = usb.getDeviceList();
  console.log("Found", devices.length, "USB devices:");

  devices.forEach((device, index) => {
    console.log(`\nDevice ${index + 1}:`);
    console.log(
      `  Vendor ID: ${device.deviceDescriptor.idVendor
        .toString(16)
        .padStart(4, "0")}`
    );
    console.log(
      `  Product ID: ${device.deviceDescriptor.idProduct
        .toString(16)
        .padStart(4, "0")}`
    );
    console.log(`  Serial Number: ${device.deviceDescriptor.iSerialNumber}`);
    console.log(`  Manufacturer: ${device.deviceDescriptor.iManufacturer}`);
    console.log(`  Product: ${device.deviceDescriptor.iProduct}`);
    // show the vendor and manufacturer strings
  });
  return devices;
}

// Connect to a specific USB device
function connectToDevice(vendorId, productId) {
  try {
    const device = usb.findByIds(vendorId, productId);
    if (!device) {
      throw new Error("Device not found");
    }

    // Open the device
    device.open();

    // Configure device
    device.interfaces.forEach((iFace) => {
      // Check if kernel driver is active
      if (iFace.isKernelDriverActive()) {
        try {
          iFace.detachKernelDriver();
        } catch (e) {
          console.error(`Error detaching kernel driver: ${e}`);
        }
      }

      try {
        iFace.claim();
      } catch (e) {
        console.error(`Error claiming interface: ${e}`);
      }
    });

    return device;
  } catch (error) {
    console.error("Error connecting to device:", error);
    throw error;
  }
}

export const connectAndSend = async (data: Buffer) => {
  // hardcode: vendorId: 0x0483, productId: 0x5740
  const idVendor = 4070;
  const idProduct = 33054;
  // const device = await connectToDevice(idVendor, idProduct);
  // // console.log(device);
  // const iFace = device.interfaces[0];
  // const endpoint = iFace.endpoints[1];

  // // Example write operation
  // await endpoint.transfer(data);
  const device = await findBySerialNumber("GD107676A72D80113");
  const webDevice = await WebUSBDevice.createInstance(device);
  await webDevice.open();
  const configuration = webDevice.configuration;
  // Claim the interface for use
  const iface = configuration.interfaces[0];
  await webDevice.claimInterface(iface.interfaceNumber);

  // "transferOut" is from computer to device

  await webDevice.transferOut(1, data);

  await webDevice.close();
};

// import { findByIds, findBySerialNumber, WebUSBDevice } from 'usb';

// (async () => {
//     // Uses a blocking call, so is async
//     const device = await findBySerialNumber('TEST_DEVICE');

//     // Uses blocking calls, so is async
//     const webDevice = await WebUSBDevice.createInstance(device);

//     if (webDevice) {
//         console.log(webDevice); // WebUSB device
//     }
// })();
