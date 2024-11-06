import { fromEnv, fromSSO } from "@aws-sdk/credential-providers";
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

export class AWSHelper {
    static async getSecret(id: string): Promise<string> {
        const client = new SecretsManagerClient({ 
            credentials: (!process.env.NODE_ENV || process.env.NODE_ENV == 'local') ? fromSSO() : fromEnv()
        });

        const secret = await client.send(
            new GetSecretValueCommand({ SecretId: id })
        );

        return secret.SecretString || '';
    }
}
