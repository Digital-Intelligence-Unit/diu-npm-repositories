import { Dyngoose } from 'dyngoose'
import { Exception } from '@adonisjs/core/exceptions'
import { DateTime } from 'luxon'

import app from '@adonisjs/core/services/app'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'

import TeamMember from './team_member.js'

// Default adonisjs auth finder cannot be used with dyngoose table
// Functions and properties marked with $A are for AdonisJS
@Dyngoose.$Table({ name: 'users' })
export default class User extends Dyngoose.Table {
    @Dyngoose.Attribute.String({ trim: true })
    name: string

    @Dyngoose.Attribute.String({ trim: true })
    username: string

    @Dyngoose.Attribute.String({ trim: true })
    organisation: string

    @Dyngoose.Attribute.String({ trim: true })
    email: string

    @Dyngoose.Attribute.String()
    password: string

    @Dyngoose.Attribute.String({ trim: true })
    authentication: string

    @Dyngoose.Attribute.Date()
    mfa_auth: Date

    @Dyngoose.$PrimaryKey('username', 'organisation')
    static readonly primaryKey: Dyngoose.Query.PrimaryKey<User, string, string>

    @Dyngoose.$DocumentClient()
    static readonly documentClient: Dyngoose.DocumentClient<User>

    get $primaryKeyValue() {
        // $A
        return this.username + '#' + this.organisation
    }

    async teams() {
        return await TeamMember.usernameOrgIndex.query({
            username: this.username,
            organisation: this.organisation,
        })
    }

    async capabilities(): Promise<Array<any>> {
        const cache = await app.container.make('cache'); // TO-DO: Use namespace
        return await cache.getOrSet(this.$primaryKeyValue + '-capabilities', async () => {
            // Get team codes
            const userTeams = await this.teams();
            const userTeamCodes = (userTeams.count > 0 ? userTeams : []).map((team) => team.teamcode)

            // Query capabilities (Not done in model for complication)
            const capabilities = (await db.rawQuery(
                `
                SELECT * FROM capability_links
                LEFT JOIN capabilities
                ON capability_links.capability_id = capabilities.id
                WHERE (
                    link_type = 'role' AND (
                        link_id IN (
                            SELECT CAST(role_id AS varchar) FROM roles
                            RIGHT JOIN role_links
                            ON roles.id = role_links.role_id
                            WHERE link_type = 'team' AND link_id = ANY (:team_codes)
                        )
                        OR
                        link_id IN (
                            SELECT CAST(role_id AS varchar) FROM roles
                            RIGHT JOIN role_links
                            ON roles.id = role_links.role_id
                            WHERE link_type = 'user'
                            AND link_id = :user_id
                        )   
                    )
                ) OR (
                    link_id = ANY (:team_codes) AND link_type = 'team'
                ) OR (
                    link_id = :user_id AND link_type = 'user'
                )
            `,
                {
                    user_id: this.$primaryKeyValue,
                    team_codes: userTeamCodes,
                }
            )).rows;

            return capabilities;
        }, { ttl: '7h' });
    }

    async updateMfa(invalidate = true) {
        // Update time
        if(invalidate == true) {
            this.mfa_auth = DateTime.now().minus({ hour: 1 }).toJSDate();
        } else {
            this.mfa_auth = DateTime.now().plus({ hour: 1 }).toJSDate();
        }

        // Save
        return await this.save();
    }

    static async find(id: string) {
        // $A
        return await this.primaryKey.get(id.split('#')[0], id.split('#')[1])
    }

    static async verifyCredentials(username: string, password: string, organisation: string) {
        // $A
        // Get user
        const user = await this.primaryKey.get(username, organisation)

        // Check password hash
        if (user && (await hash.verify(user.password, password))) {
            user.updateMfa(true);
            return user
        } else {
            throw new Exception('Username or password incorrect', {
                status: 400,
                code: 'E_INVALID',
            })
        }
    }

    async createUserForGuard(user: User) {
        return {
            getId() {
                return user.$primaryKeyValue
            },
            getOriginal() {
                return user
            },
        }
    }
    
    // TO-DO: Add beforesave hook for password
}
