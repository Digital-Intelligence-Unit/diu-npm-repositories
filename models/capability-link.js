const BaseModel = require("./base/postgres");
class CapabilityLinkModel extends BaseModel {
    tableName = "capability_links";

    create(attributes, callback) {
        // Check whether link exists
        this.query(
            {
                text: "SELECT * FROM capability_links WHERE capability_id = $1 AND link_type = $2 AND link_id = $3 AND valuejson = $4",
                values: [attributes.capability_id, attributes.link_type, attributes.link_id, attributes.valuejson || null],
            },
            (error, capabilities) => {
                if (error) {
                    callback(error, null);
                }

                // Update if link does exist
                if (capabilities.length > 0) {
                    super.updateByPrimaryKey(capabilities[0].id, attributes, callback);
                } else {
                    super.create(attributes, callback);
                }
            }
        );
    }

    link(newCapabilities, metadata, callback) {
        // Get existing rows
        this.getByTypeId(metadata.type, metadata.id, (err, links) => {
            if (err) {
                callback(err, null);
            }

            // Create new links
            const currentCapabilityIds = links.map((l) => l.capability_id);
            newCapabilities
                .filter((c) => !currentCapabilityIds.includes(c.capability_id))
                .forEach((capability) => {
                    this.create(
                        {
                            capability_id: capability.id,
                            link_id: metadata.id,
                            link_type: metadata.type,
                            approved_by: metadata.approved_by,
                            valuejson: capability.valuejson,
                        },
                        (error) => {
                            if (error) {
                                callback(error, null);
                            }
                        }
                    );
                });

            // Delete old links
            const newCapabilityIds = newCapabilities.map((l) => l.id);
            let oldCapabilities = links.filter((l) => !newCapabilityIds.includes(l.capability_id));
            if (metadata.managed_capabilities && metadata.managed_capabilities.length > 0) {
                const arrManagedCapabilities = metadata.managed_capabilities.map((capability) => {
                    return capability.id;
                });
                oldCapabilities = oldCapabilities.filter((capability) => {
                    return arrManagedCapabilities.includes(capability.capability_id);
                });
            }
            if (oldCapabilities.length > 0) {
                this.query(
                    {
                        text: `DELETE FROM ${this.tableName} WHERE id IN (${oldCapabilities.map((l) => l.id).join(",")})`,
                    },
                    (error) => {
                        if (error) {
                            callback(error, null);
                        }
                    }
                );
            }

            callback(null, newCapabilities);
        });
    }

    getByTypeId(type, typeId, callback) {
        this.query(
            {
                text: "SELECT * FROM capability_links WHERE link_type = $1 AND link_id = $2",
                values: [type, typeId],
            },
            callback
        );
    }

    getByCapabilityId(capabilityID, callback) {
        this.query(`SELECT * FROM capability_links WHERE capability_id IN (${capabilityID}) AND link_type = 'user'`, callback);
    }

    deleteByLinkable(capabilityId, type, typeId, callback) {
        this.query(
            {
                text: `DELETE FROM ${this.tableName} WHERE capability_id = $1 AND link_type = $2 AND link_id = $3`,
                values: [capabilityId, type, typeId],
            },
            callback
        );
    }

    deleteByLinkId(type, typeId, callback) {
        this.query(
            {
                text: `DELETE FROM ${this.tableName} WHERE link_type = $1 AND link_id = $2`,
                values: [type, typeId],
            },
            callback
        );
    }
}

module.exports = CapabilityLinkModel;
