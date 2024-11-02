import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = "us-east-005"; // or your region
const BUCKET_NAME = "coloring-book-pages"; //"1274be2d7c25eea59f270918"; // or coloring-book-pages
const ACCESS_KEY_ID = process.env.BACKBLAZE_API_KEY_ID as string;
const SECRET_ACCESS_KEY = process.env.BACKBLAZE_API_KEY as string;

// Create an S3 client configured for Backblaze
const s3Client = new S3Client({
  region: REGION,
  endpoint: "https://s3.us-east-005.backblazeb2.com", // Adjust the endpoint based on your region
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function uploadImage(
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string = "image/png"
) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: imageBuffer,
      ContentType: mimeType,
    });

    const response = await s3Client.send(command);
    console.log("Image uploaded successfully:", response);
    return response;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// Example usage
// const imageBuffer = Buffer.from('<your-image-data>', 'base64');
// await uploadImage(imageBuffer, 'example-image.png', 'image/png');
