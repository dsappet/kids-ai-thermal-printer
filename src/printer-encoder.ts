import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

export const encodeImage = (image: Buffer) => {
  const encoder = new ReceiptPrinterEncoder({
    columns: 48,
    feedBeforeCut: 4,
  });
  return encoder.initialize()
  .codepage("auto")
  .align("center")
  .text("A FUN PICTURE")
  .newline()
  .image(image)
  .newline()
  .encode();
};
