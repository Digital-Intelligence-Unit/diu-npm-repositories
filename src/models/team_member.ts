import { Dyngoose } from 'dyngoose'
import { v4 as uuidv4 } from 'uuid';

@Dyngoose.$Table({ name: 'teammembers' })
export default class TeamMember extends Dyngoose.Table {
    @Dyngoose.Attribute.String()
    id: string

    @Dyngoose.Attribute.String({ trim: true })
    teamcode: string

    @Dyngoose.Attribute.String({ trim: true })
    email: string

    @Dyngoose.Attribute.String({ trim: true })
    username: string

    @Dyngoose.Attribute.String({ trim: true })
    organisation: string

    @Dyngoose.Attribute.Date({ nowOnCreate: true })
    joindate: string

    @Dyngoose.Attribute.String({ trim: true })
    approved_by: string

    @Dyngoose.$PrimaryKey('id', 'teamcode')
    static readonly primaryKey: Dyngoose.Query.PrimaryKey<TeamMember, string, string>

    @Dyngoose.$GlobalSecondaryIndex({ hashKey: 'username', rangeKey: 'organisation', name: 'username-organisation-index' })
    static readonly usernameOrgIndex: Dyngoose.Query.GlobalSecondaryIndex<TeamMember>

    @Dyngoose.$DocumentClient()
    static readonly documentClient: Dyngoose.DocumentClient<TeamMember>

    get $primaryKeyValue() {
        // $A
        return this.id
    }

    async beforeSave(event: Dyngoose.Events.BeforeSaveEvent<this>): Promise<any> {
        if(!this.id) { this.id = uuidv4(); }
    }
}
