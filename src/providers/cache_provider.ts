import type { ApplicationService } from '@adonisjs/core/types'

import { BentoCache, bentostore } from 'bentocache'
import { dynamoDbDriver } from 'bentocache/drivers/dynamodb'

declare module '@adonisjs/core/types' {
    interface ContainerBindings {
      cache: BentoCache<any>
    }
}

export default class CacheProvider {

    constructor(protected app: ApplicationService) {}

    register() {
        this.app.container.singleton('cache', function () {
            return new BentoCache({
                default: 'dynamo',
                stores: {
                  dynamo: bentostore().useL2Layer(dynamoDbDriver({
                    region: 'eu-west-2',
                    endpoint: 'https://dynamodb.eu-west-2.amazonaws.com',
                    table: {
                      name: 'cache' // Name of the table
                    },
              
                    // Credentials to use to connect to DynamoDB
                    credentials: {
                      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
                    }
                  }))
                }
            });
        })
    }
}
