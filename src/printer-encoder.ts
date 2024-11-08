import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import sharp from "sharp";
import pixels from "image-pixels";

export const encodeImage = async (image: Buffer | string) => {
  // First, let's verify the image data
  const metadata = await sharp(image).metadata();
  console.log("Original image metadata:", metadata);

  let buffer;

  // Resize the image to fit printer width (384px) while maintaining aspect ratio
  buffer = await sharp(image)
    .resize(384, 384, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toBuffer({ resolveWithObject: true });

  const { data, info } = buffer;

  let imageData = await pixels(data);

  const encoder = new ReceiptPrinterEncoder({
    columns: 48, // 384 pixels / 8 dots per byte = 48 columns
    feedBeforeCut: 2,
  });

  return encoder
    .initialize()
    .codepage("auto")
    .newline()
    .align("center")
    .size(2)
    .line("Happy Birthday Rosie!")
    .newline()
    .image(imageData, info.width, info.height, "atkinson")
    .newline()
    .size(1)
    .text("To see all the creations, visit:")
    .text("https://rosiebirthday.art")
    .newline()
    .qrcode("https://rosiebirthday.art")
    .align("left")
    .newline(2)
    .cut()
    .encode();
};
