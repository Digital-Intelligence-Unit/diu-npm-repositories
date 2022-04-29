const BaseModel = require("./base/postgres");
class RoleLinkModel extends BaseModel {
    tableName = "role_links";

    link(roles, metadata, callback) {
        // Get existing rows
        this.getByLinkId(metadata.type, metadata.id, (err, links) => {
            if (err) {
                callback(err, null);
            }
            // Create new links
            const currentRoles = links.map((l) => l.role_id);
            roles
                .filter((c) => !currentRoles.includes(c))
                .forEach((role) => {
                    this.create(
                        {
                            role_id: role,
                            link_id: metadata.id,
                            link_type: metadata.type,
                            approved_by: metadata.approved_by,
                        },
                        (error) => {
                            if (error) {
                                callback(error, null);
                            }
                        }
                    );
                });

            // Delete old links
            const oldRoles = links.filter((l) => !roles.includes(l.role_id));
            if (oldRoles.length > 0) {
                this.query(
                    {
                        text: `DELETE FROM ${this.tableName} WHERE id IN (${oldRoles.map((l) => l.id).join(",")})`,
                    },
                    (error) => {
                        if (error) {
                            callback(error, null);
                        }
                    }
                );
            }

            callback(null, roles);
        });
    }

    getByLinkId(type, typeId, callback) {
        this.query(
            {
                text: `SELECT * FROM ${this.tableName} WHERE link_type = $1 AND link_id = $2`,
                values: [type, typeId],
            },
            callback
        );
    }

    deleteByLinkable(roleId, type, typeId, callback) {
        this.query(
            {
                text: `DELETE FROM ${this.tableName} WHERE role_id = $1 AND link_type = $2 AND link_id = $3`,
                values: [roleId, type, typeId],
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

module.exports = RoleLinkModel;
