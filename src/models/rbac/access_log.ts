import { Dyngoose } from "dyngoose";
import { DateTime } from "luxon";
import { cuid } from "@adonisjs/core/helpers";

@Dyngoose.$Table({ name: "access_logs" })
export default class AccessLog extends Dyngoose.Table {
    @Dyngoose.Attribute.String()
    date: string;

    @Dyngoose.Attribute.String()
    uuid: string;

    @Dyngoose.Attribute.Dynamic()
    data: any;

    @Dyngoose.Attribute.String()
    time: string;

    @Dyngoose.Attribute.String()
    type: string;

    @Dyngoose.Attribute.String({ trim: true })
    "username#org": string;

    @Dyngoose.$PrimaryKey("date")
    static readonly primaryKey: Dyngoose.Query.PrimaryKey<AccessLog, string>;

    @Dyngoose.$DocumentClient()
    static readonly documentClient: Dyngoose.DocumentClient<AccessLog>;

    @Dyngoose.$GlobalSecondaryIndex({ name: 'type-date-index', hashKey: 'type', rangeKey: 'date' }) 
    static readonly typeIndex: Dyngoose.Query.GlobalSecondaryIndex<AccessLog>

    @Dyngoose.$GlobalSecondaryIndex({ name: 'username-org-date-index', hashKey: 'username#org', rangeKey: 'date' }) 
    static readonly userIndex: Dyngoose.Query.GlobalSecondaryIndex<AccessLog>

    get $primaryKeyValue() {
        // $A
        return this.date;
    }

    static async log(type: string, userId: string, data = null) {
        await new AccessLog({ 
            type: type, 
            "username#org": userId,
            data
        }).save();
    }

    async beforeSave(
        event: Dyngoose.Events.BeforeSaveEvent<this>,
    ): Promise<any> {
        // Set default attributes
        this.date = DateTime.now().toISODate();
        this.uuid = DateTime.now().toFormat("H:m:s") + "#" + cuid();
        this.time = DateTime.now().toFormat("H:m:s");
    }
}
