const SecretsManager = require("aws-sdk/clients/secretsmanager");
const S3 = require("aws-sdk/clients/s3");

class Aws {
    static async getSecrets(secretName) {
        const clientparams = { region: process.env.AWSREGION || "eu-west-2" };
        if (process.env.AWS_SECRETID && process.env.AWS_SECRETID) {
            clientparams["accessKeyId"] = process.env.AWS_SECRETID;
            clientparams["secretAccessKey"] = process.env.AWS_SECRETKEY;
        }
        const client = new SecretsManager(clientparams);

        return new Promise((resolve, reject) => {
            client.getSecretValue({ SecretId: secretName }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if ("SecretString" in data) {
                        resolve(data.SecretString);
                    } else {
                        resolve(Buffer.from(data.SecretBinary, "base64").toString("ascii"));
                    }
                }
            });
        });
    }

    getSecretsAsync(secretName, callback) {
        const clientparams = { region: process.env.AWSREGION || "eu-west-2" };
        if (process.env.AWS_SECRETID && process.env.AWS_SECRETID) {
            clientparams["accessKeyId"] = process.env.AWS_SECRETID;
            clientparams["secretAccessKey"] = process.env.AWS_SECRETKEY;
        }
        const client = new SecretsManager(clientparams);
        client.getSecretValue({ SecretId: secretName }, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                if ("SecretString" in data) {
                    callback(null, data.SecretString);
                } else {
                    callback(null, Buffer.from(data.SecretBinary, "base64").toString("ascii"));
                }
            }
        });
    }

    static async getUploadUrl(bucketName, fileName, contentType) {
        const s3 = new S3({
            secretAccessKey: process.env.AWS_SECRETKEY,
            accessKeyId: process.env.AWS_SECRETID,
            region: process.env.AWSREGION || "eu-west-2",
        });
        const s3Params = {
            Bucket: bucketName,
            Fields: {
                key: fileName,
                ContentType: contentType,
            },
            Expires: 60,
        };
        const getUploadUrl = await s3.createPresignedPost(s3Params);
        return getUploadUrl;
    }
}

module.exports = Aws;
