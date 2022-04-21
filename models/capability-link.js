const BaseModel = require('./base/postgres');
class CapabilityLinkModel extends BaseModel {

    tableName = 'capability_links';

    link(capabilities, metadata, callback) {
        //Get existing rows
        this.getByTypeId(metadata.type, metadata.id, (err, links) => {
            //Create new links
            let currentCapabilities = links.map(l => l.capability_id);
            capabilities.filter(c => !currentCapabilities.includes(c)).forEach((capability) => {
                this.create({
                    capability_id: capability,
                    link_id: metadata.id,
                    link_type: metadata.type,
                    approved_by: metadata.approved_by
                }, (error) => {
                    if (error) { callback("Error executing query", null); return; }
                });
            })

            //Delete old links
            let oldCapabilities = links.filter(l => !capabilities.includes(l.capability_id));
            if(oldCapabilities.length > 0) {
                this.query({
                    text: `DELETE FROM ${this.tableName} WHERE id IN (${oldCapabilities.map(l => l.id).join(',')})`
                }, (error) => {
                    if (error) { callback("Error executing query", null); return; }
                });
            }

            callback(null, capabilities);
        });
    }

    getByTypeId(type, type_id, callback) {
        this.query({ 
            text: "SELECT * FROM capability_links WHERE link_type = $1 AND link_id = $2", 
            values: [type, type_id]
        }, callback);
    }

    deleteByLinkable(capability_id, type, type_id, callback) {
        this.query({
            text: `DELETE FROM ${this.tableName} WHERE capability_id = $1 AND link_type = $2 AND link_id = $3`,
            values: [capability_id, type, type_id]
        }, callback);
    }

    deleteByLinkId(type, type_id, callback) {
        this.query({
            text: `DELETE FROM ${this.tableName} WHERE link_type = $1 AND link_id = $2`,
            values: [type, type_id]
        }, callback);
    }
}

module.exports = CapabilityLinkModel;