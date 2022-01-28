import { S3Client } from "@aws-sdk/client-s3";

// Create an Amazon S3 service client object.
export default new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
});
