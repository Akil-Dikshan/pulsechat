import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Create S3 client inside the function so env vars are loaded
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const fileExtension = req.file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3.send(command);

    const fileUrl = `${process.env.CLOUDFRONT_URL}/${fileName}`;

    res.status(200).json({
      url: fileUrl,
      type: req.file.mimetype.startsWith("image/") ? "image" : "file",
      name: req.file.originalname,
    });
  } catch (error) {
    console.error("Error in uploadFile:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};