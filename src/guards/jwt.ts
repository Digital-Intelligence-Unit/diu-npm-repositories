import { symbols, errors } from '@adonisjs/auth'
import { AuthClientResponse, GuardContract } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'

/**
 * Custom user guard types
 * See https://docs.adonisjs.com/guides/authentication/custom-auth-guard
 */
export type JwtGuardOptions = {
    secret: string
}
export type JwtGuardUser<RealUser> = {
    getId(): string | number | BigInt

    getOriginal(): RealUser
}
export interface JwtUserProviderContract<RealUser> {
    [symbols.PROVIDER_REAL_USER]: RealUser

    createUserForGuard(user: RealUser): Promise<JwtGuardUser<RealUser>>

    findById(identifier: string | number | BigInt): Promise<JwtGuardUser<RealUser> | null>
}

export class JwtGuard<UserProvider extends JwtUserProviderContract<unknown>>
    implements GuardContract<UserProvider[typeof symbols.PROVIDER_REAL_USER]>
{
    #ctx: HttpContext
    #userProvider: UserProvider
    #options: JwtGuardOptions

    constructor(
        ctx: HttpContext,
        userProvider: UserProvider,
        options: JwtGuardOptions
    ) {
        this.#ctx = ctx
        this.#userProvider = userProvider
        this.#options = options
    }

    declare [symbols.GUARD_KNOWN_EVENTS]: {}
    
    driverName: 'jwt' = 'jwt'
    authenticationAttempted: boolean = false
    isAuthenticated: boolean = false

    user?: UserProvider[typeof symbols.PROVIDER_REAL_USER]

    async generate(user: UserProvider[typeof symbols.PROVIDER_REAL_USER]) {
        const providerUser = await this.#userProvider.createUserForGuard(user)
        const token = jwt.sign({ userId: providerUser.getId() }, this.#options.secret, {
            expiresIn: "7h",
            issuer: 'LCSIS API'
        })

        return {
            type: 'bearer',
            token: token
        }
    }

    async authenticate(): Promise<UserProvider[typeof symbols.PROVIDER_REAL_USER]> {
        /**
         * Avoid re-authentication when it has been done already
         * for the given request
         */
        if (this.authenticationAttempted) {
            return this.getUserOrFail()
        }
        this.authenticationAttempted = true
    
        /**
         * Ensure the auth header exists
         */
        const authHeader = this.#ctx.request.header('authorization')
        if (!authHeader) {
            throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
                guardDriverName: this.driverName,
            })
        }
    
        /**
         * Split the header value and read the token from it
         */
        const [, token] = authHeader.split('Bearer ')
        if (!token) {
            throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
                guardDriverName: this.driverName,
            })
        }
    
        /**
         * Verify token
         */
        const payload = jwt.verify(token, this.#options.secret)
        if (typeof payload !== 'object' || !('userId' in payload)) {
            throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
                guardDriverName: this.driverName,
            })
        }
    
        /**
         * Fetch the user by user ID and save a reference to it
         */
        const providerUser = await this.#userProvider.findById(payload.userId)
        if (!providerUser) {
            throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
            guardDriverName: this.driverName,
            })
        }
    
        this.user = providerUser.getOriginal()
        return this.getUserOrFail()
    }

    async check(): Promise<boolean> {
        try {
            await this.authenticate()
            return true
        } catch {
            return false
        }
    }

    getUserOrFail(): UserProvider[typeof symbols.PROVIDER_REAL_USER] {
        if (!this.user) {
            throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
              guardDriverName: this.driverName,
            })
        }
      
        return this.user
    }

    async authenticateAsClient(
        user: UserProvider[typeof symbols.PROVIDER_REAL_USER]
    ): Promise<AuthClientResponse> {
        const token = await this.generate(user)
        return {
            headers: {
                authorization: `Bearer ${token.token}`,
            },
        }
    }
}
