import { findBySerialNumber, webusb } from "usb";
import { encodeImage } from "./src/printer-encoder";
import { sendBufferToDevice } from "./src/usb";
import { connectAndSend, listUsbDevices } from "./src/usb-legacy";

const test = async () => {
  // Use BUN to read in the test image
  const image = Bun.file("mermaid-unicorn.png");

  // get the data of the image
  const imageData = await image.arrayBuffer();
  const buffer = Buffer.from(imageData);

  // Now encode the image
  const encodedImage = await encodeImage(buffer);
  await connectAndSend(encodedImage);
  // await sendBufferToDevice(encodedImage);
};

const testUsb = async () => {
  const devices = listUsbDevices();

  console.log(devices);
};

// listUsbDevices();
// const device = await findBySerialNumber("GD107676A72D80113");
// console.log(device);
// console.log(device.interfaces);
test();
// testUsb();
