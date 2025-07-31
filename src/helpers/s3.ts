import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWSHelper } from "./aws.js";

export class S3 {
    s3Client;

    constructor() {
        this.s3Client = new S3Client({
            credentials: AWSHelper.getCredentials()
        });
    }

    async getObject(bucketName: string, fileName: string) {
        return await this.s3Client.send(
            new GetObjectCommand({
                Bucket: bucketName,
                Key: fileName,
                ResponseExpires: new Date(new Date().getTime() + 600),
            })
        );
    }

    async getObjectAccessUrl(bucketName: string, fileName: string) {
        return await getSignedUrl(this.s3Client, new GetObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ResponseExpires: new Date(new Date().getTime() + 600),
        }));
    }

    async getObjectUploadUrl(bucketName: string, fileName: string) {
        return await createPresignedPost(this.s3Client, {
            Bucket: bucketName,
            Key: fileName,
            Expires: 60,
        });
    }
}