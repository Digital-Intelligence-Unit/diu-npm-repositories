import { symbols } from '@adonisjs/auth'
import {
  SessionGuardUser,
  SessionUserProviderContract
} from '@adonisjs/auth/types/session'

import type UserType from '../models/user.js';
import { configProvider } from '@adonisjs/core';

export type SessionDynamoUserProviderOptions<UserType> = {
  /**
   * The model to use for users lookup
   */
  model: () => Promise<any>
}

export class SessionDynamoUserProvider implements SessionUserProviderContract<UserType> {
  
  declare [symbols.PROVIDER_REAL_USER]: UserType

  protected model: any;

  constructor(
    protected options: SessionDynamoUserProviderOptions<UserType>
  ) {}

  protected async getModel() {
    if (this.model && !('hot' in import.meta)) {
      return this.model
    }

    const importedModel = await this.options.model()
    this.model = importedModel.default
    return this.model
  }

  async createUserForGuard(user: UserType): Promise<SessionGuardUser<UserType>> {
    return {
      getId() {
        return user.username + '#' + user.organisation
      },
      getOriginal() {
        return user
      },
    }
  }

  async findById(identifier: string): Promise<SessionGuardUser<UserType> | null> {
    const model = await this.getModel();
    const user = await model.find(identifier);
    
    if (!user) {
      return null
    }

    return this.createUserForGuard(user)
  }
}

export function dynamoSessionUserProvider(options: { model?: any } = { model: null }) {
  return configProvider.create(async () => {
    const { SessionDynamoUserProvider } = await import('diu-data-functions/providers/session_dynamo')
    return new SessionDynamoUserProvider({
      model: () => import('diu-data-functions/models/user'),
    })
  })
}