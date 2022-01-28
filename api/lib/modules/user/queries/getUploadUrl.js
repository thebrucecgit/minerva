import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import client from "../../../config/s3";

export default async function getUploadUrl(_, { fileName }) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: nanoid(),
    Metadata: {
      OriginalFileName: fileName,
    },
  });

  return await getSignedUrl(client, command, {
    expiresIn: 60 * 60 * 24, // 24 hrs
  });
}
