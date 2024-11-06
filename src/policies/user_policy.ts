import User from 'diu-data-functions/models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
    
    userCapabilities: Array<any>  = [];

    async before(user: User) {
        // Get user's capability
        this.userCapabilities = await user.capabilities();
    }

    /**
     * Every logged-in user can create a post
     */
    capability(user: User, capability: string): AuthorizerResponse {
        return this.userCapabilities.findIndex((cap) => cap.name == capability) >= 0;
    }
}
