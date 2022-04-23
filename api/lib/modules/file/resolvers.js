import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import client from "../../config/s3";
import { assertAdmin } from "../../helpers/permissions";

const expiresIn = 60 * 60 * 24; // 24 hrs;

export default {
  Query: {
    async getUploadUrl(_, { fileName }) {
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: nanoid(),
        Metadata: {
          OriginalFileName: fileName,
        },
      });

      return await getSignedUrl(client, command, { expiresIn });
    },
  },
  FileMeta: {
    async link(fileMeta, _, { user }) {
      // TODO: Figure out how to give access to the owner of the file as well
      assertAdmin(user);
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileMeta.id,
        ResponseContentDisposition: `attachment; filename="${fileMeta.name}"`,
      });
      return await getSignedUrl(client, command, { expiresIn });
    },
  },
};
