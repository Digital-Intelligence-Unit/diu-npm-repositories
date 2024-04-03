const { fromIni } = require("@aws-sdk/credential-providers");
const SecretsManager = require("aws-sdk/clients/secretsmanager");
const AWSS3 = require("aws-sdk/clients/s3");

class Aws {
    static async getCredentials() {
        // Get correct credentials
        const credentials = { region: process.env.AWSREGION || "eu-west-2" };
        if (process.env.AWS_SECRETID) {
            credentials["accessKeyId"] = process.env.AWS_SECRETID;
            credentials["secretAccessKey"] = process.env.AWS_SECRETKEY;
        } else {
            credentials["credentials"] = await fromIni({
                profile: "default"
            })();
        }

        return credentials;
    }

    static async getEnvironmentConfig(env, application, name) {
        // Get variables from s3
        const s3 = new AWSS3(await this.getCredentials());
        const response = await s3.getObject({
            Bucket: "lscics-sis-infra-assets-ew2-" + env,
            Key: `${application}/${name}.config.json`
        }).promise();

        // Return environment
        return JSON.parse(response.Body.toString("utf-8"));
    }

    static async getSecrets(secretName) {
        // Create client
        const client = new SecretsManager(await this.getCredentials());

        // Get secret
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
