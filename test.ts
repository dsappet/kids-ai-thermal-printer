import { webusb } from "usb";
import { encodeImage } from "./src/printer-encoder";
import { sendBufferToDevice } from "./src/usb";
import { listUsbDevices } from "./src/usb-legacy";

const test = async () => {
  // Use BUN to read in the test image
  const image = Bun.file("mermaid-unicorn.png");

  // get the data of the image
  const imageData = await image.arrayBuffer();
  const buffer = Buffer.from(imageData);

  // Now encode the image
  const encodedImage = await encodeImage(buffer);

  await sendBufferToDevice(encodedImage);
};

const testUsb = async () => {
  const devices = listUsbDevices();
  console.log(devices);
};

testUsb();
