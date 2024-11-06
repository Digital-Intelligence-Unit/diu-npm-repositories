import { AWSHelper } from "./aws.js"
import { fromEnv } from "@aws-sdk/credential-providers";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export class EnvHelper {
    static async setPrimarySecrets() {
        // Configure postgres
        const postgresCredentials = JSON.parse(await AWSHelper.getSecret('postgres'))
        process.env.DB_USER = postgresCredentials.username
        process.env.DB_PASSWORD = postgresCredentials.password

        // Configure app secrets
        const jwtCredentials = JSON.parse(await AWSHelper.getSecret('jwt'))
        process.env.JWT_SECRET = jwtCredentials.secret
        process.env.JWT_SECRETKEY = jwtCredentials.secretkey

        // Configure AWS
        const awsCredentials = JSON.parse(await AWSHelper.getSecret('awsdev'))
        process.env.AWS_ACCESS_KEY_ID = awsCredentials.secretid
        process.env.AWS_SECRET_ACCESS_KEY = awsCredentials.secretkey

        // Configure AWS
        const appCredentials = JSON.parse(await AWSHelper.getSecret('adonisjs_api'));
        Object.keys(appCredentials).forEach((key) => {
            process.env[key] = appCredentials[key];
        });

        process.env.TZ = 'Europe/London'
    }

    static async setAtomicSecrets() {
        // TEMP: DIU data functions compatibility
        process.env.POSTGRES_UN = process.env.DB_USER
        process.env.POSTGRES_PW = process.env.DB_PASSWORD
        process.env.PGDATABASE = process.env.DB_HOST || 'localhost'
        process.env.AWS_SECRETID = process.env.AWS_SECRETID || process.env.AWS_ACCESS_KEY_ID
        process.env.AWS_SECRETKEY = process.env.AWS_SECRETKEY || process.env.AWS_SECRET_ACCESS_KEY

        // Set config from atomic payload (Temporary implementation)
        const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient(fromEnv()));
        let payload = (await documentClient.send(
            new QueryCommand({
                TableName: "atomic_payload",
                KeyConditionExpression: "id = :id AND #type = :type",
                ExpressionAttributeNames: {
                    '#type': 'type'
                },
                ExpressionAttributeValues: {
                    ':id': 'apisettings',
                    ':type': 'ApiSettings'
                }
            })
        )) as any;
        payload = payload.Items ? payload.Items[0].config : { configuration: [] }

        // Configure
        for (let i = 0; i < payload.configuration.length; i++) {
            // Set env variables
            const apiSetting = payload.configuration[i]
            try {
                // Get from secrets manager
                const credentials = JSON.parse(await AWSHelper.getSecret(apiSetting.secretName))
                apiSetting.secrets.forEach((secret: { [x: string]: string | number }) => {
                    const key = Object.keys(secret)[0]
                    process.env[key] = credentials[secret[key]]
                })
                console.log('Loaded configuration for: ' + apiSetting.configName)
            } catch (e) {
                console.error('Could not configure ' + apiSetting.configName + ' settings')
            }
        }

        return payload;
    }
}