import { symbols } from '@adonisjs/auth'
import { configProvider } from '@adonisjs/core'
import {
  SessionGuardUser,
  SessionUserProviderContract
} from '@adonisjs/auth/types/session'

import User from '../models/user.js';
import type UserType from '../models/user.js';

export type SessionDynamoUserProviderOptions<User> = {
  /**
   * The model to use for users lookup
   */
  model: () => Promise<any>
}

export class SessionDynamoUserProvider implements SessionUserProviderContract<UserType> {
  declare [symbols.PROVIDER_REAL_USER]: UserType

  constructor(
    /**
     * Lucid provider options
     */
    protected options: SessionDynamoUserProviderOptions<UserType>
  ) {}

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
    const user = await User.find(identifier);
    
    if (!user) {
      return null
    }

    return this.createUserForGuard(user)
  }
}

export function dynamoSessionUserProvider(options: { model: any }) {
  return configProvider.create(async () => {
    const { SessionDynamoUserProvider } = await import('./session_dynamo_user_provider.js')
    return new SessionDynamoUserProvider(options)
  })
}