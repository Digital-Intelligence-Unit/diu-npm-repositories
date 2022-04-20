const SecretsManager = require("aws-sdk/clients/secretsmanager");
class Aws {
    static async getSecrets(secretName) {
        let clientparams = { region: process.env.AWSREGION || "eu-west-2" };
        if (process.env.AWSOPSID && process.env.AWSOPSKEY) {
            clientparams["accessKeyId"] = process.env.AWSOPSID;
            clientparams["secretAccessKey"] = process.env.AWSOPSKEY;
        }
        let client = new SecretsManager(clientparams);

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
}

module.exports = Aws;