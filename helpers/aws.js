const SecretsManager = require("aws-sdk/clients/secretsmanager");
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
}

module.exports = Aws;
