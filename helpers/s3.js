const S3Client = require("aws-sdk/clients/s3");
class S3 {
    s3Client;

    constructor() {
        this.s3Client = new S3Client({
            secretAccessKey: process.env.AWS_SECRETKEY,
            accessKeyId: process.env.AWS_SECRETID,
            region: process.env.AWSREGION || "eu-west-2",
        });
    }

    async getObject(bucketName, fileName) {
        const object = await this.s3Client.getObject({
            Bucket: bucketName,
            Key: fileName,
            Expires: 600,
        });

        return object;
    }

    async getObjectAccessUrl(bucketName, fileName) {
        const accessUrl = await this.s3Client.getSignedUrlPromise("getObject", {
            Bucket: bucketName,
            Key: fileName,
            Expires: 600,
        });

        return accessUrl;
    }

    async getObjectUploadUrl(bucketName, fileName, contentType) {
        const getUploadUrl = await this.s3Client.createPresignedPost({
            Bucket: bucketName,
            Fields: {
                key: fileName,
                ContentType: contentType,
            },
            Expires: 60,
        });

        return getUploadUrl;
    }
}

module.exports = S3;
