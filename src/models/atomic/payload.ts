import { Dyngoose } from 'dyngoose'

@Dyngoose.$Table({ name: 'atomic_payload' })
export default class AtomicPayload extends Dyngoose.Table {
    @Dyngoose.Attribute.String()
    id: string

    @Dyngoose.Attribute.String()
    type: string

    @Dyngoose.Attribute.String()
    config: string

    @Dyngoose.$PrimaryKey('id', 'type')
    static readonly primaryKey: Dyngoose.Query.PrimaryKey<AtomicPayload, string, string>

    @Dyngoose.$DocumentClient()
    static readonly documentClient: Dyngoose.DocumentClient<AtomicPayload>
}