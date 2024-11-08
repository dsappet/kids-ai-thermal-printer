import { webusb } from "usb";

const VERBOSE_LOGGING = false;

export const sendBufferToDevice = async (data: Buffer) => {
  const device = await webusb.requestDevice({
    filters: [{ serialNumber: "GD107676A72D80113" }], // [{ vendorId: 0x0483, productId: 0x5740 }],
  });

  // console.log(device);
  // Device with Product ID 0x811e, Vendor ID 0x0fe6, Serial Number GD107676A72D80113
  // manufacturerName: "RONGTA",
  // productName: "USB Receipt Printer",
  // serialNumber: "GD107676A72D80113",

  await device.open();

  const configuration = device.configuration;
  if (!configuration) {
    throw new Error("Device has no configuration");
  }

  if (VERBOSE_LOGGING)
    configuration.interfaces.forEach((iface) => {
      iface.alternate.endpoints.forEach((endpoint) => {
        console.log(`Endpoint Number: ${endpoint.endpointNumber}`);
        console.log(`Direction: ${endpoint.direction}`);
        console.log(`Type: ${endpoint.type}`);
      });
    });

  // The results of the above finds one endpoint that is an IN and out, number 1
  // For now, just hardcode it

  // Claim the interface for use
  const iface = configuration.interfaces[0];
  await device.claimInterface(iface.interfaceNumber);

  // "transferOut" is from computer to device

  await device.transferOut(1, data);

  await device.close();

  // const config = await device.configuration.get();
};
