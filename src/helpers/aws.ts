import { fromEnv, fromSSO } from "@aws-sdk/credential-providers";
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { parseArgs } from "util";
import { profile } from "console";

export class AWSHelper {
    static getCredentials() {
        if(!process.env.NODE_ENV || process.env.NODE_ENV == 'local') {
            // Get local aws profile
            return fromSSO({ profile: process.env.AWS_PROFILE || 'default' });
        } else {
            // To do: Change to fromTemporaryCredentials()
            return fromEnv();
        }
    }

    static async getSecret(id: string): Promise<string> {
        const client = new SecretsManagerClient({
            credentials: AWSHelper.getCredentials()
        });

        const secret = await client.send(
            new GetSecretValueCommand({ SecretId: id })
        );

        return secret.SecretString || '';
    }
}
