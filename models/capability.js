const BaseModel = require("./base/postgres");
class CapabilityModel extends BaseModel {
    tableName = "capabilities";

    getByName(name, callback) {
        this.query({
            text: `SELECT * FROM ${this.tableName} WHERE name = $1`,
            values: [name]
        }, callback);
    }

    getByTag(tagName, callback) {
        const query = `SELECT * FROM ${this.tableName} WHERE $1 = ANY(tags)`;
        this.query({ text: query, values: [tagName] }, callback);
    }

    getByTagsAnd(tagArray, callback) {
        if (tagArray.length) {
            let query = `SELECT * FROM ${this.tableName}`;
            let tagCounter = 0;
            tagArray.forEach((tagName) => {
                if (tagCounter) {
                    query += ` AND $${tagCounter + 1} = ANY(tags)`;
                } else {
                    query += ` WHERE $${tagCounter + 1} = ANY(tags)`;
                }
                tagCounter++;
            });
            this.query({ text: query, values: tagArray }, callback);
        }
    }

    getByTagsOr(tagArray, callback) {
        if (tagArray.length) {
            let query = `SELECT * FROM ${this.tableName}`;
            let tagCounter = 0;
            tagArray.forEach((tagName) => {
                if (tagCounter) {
                    query += ` OR $${tagCounter + 1} = ANY(tags)`;
                } else {
                    query += ` WHERE $${tagCounter + 1} = ANY(tags)`;
                }
                tagCounter++;
            });
            this.query({ text: query, values: tagArray }, callback);
        }
    }

    getByLinkId(type, typeId, callback) {
        this.query(
            {
                text: `SELECT ${this.tableName}.*, capability_links.link_type, capability_links.link_id, capability_links.valuejson 
                FROM ${this.tableName}
                RIGHT JOIN capability_links 
                ON capabilities.id = capability_links.capability_id 
                WHERE link_type = $1 AND link_id = $2`,
                values: [type, typeId.toString()],
            },
            callback
        );
    }

    getByLinkIds(type, typeId, callback) {
        const query =
            `SELECT ${this.tableName}.*, capability_links.link_type, capability_links.link_id, capability_links.valuejson
             FROM ${this.tableName} RIGHT JOIN capability_links ON ${this.tableName}.id = capability_links.capability_id
             WHERE link_type = $1 AND link_id IN (` +
                typeId.map((u, i) => "$" + (i + 2)) +
             ")";
        this.query({ text: query, values: [type].concat(typeId) }, callback);
    }

    getAllCapabilitiesFromTeamArrayAndUserID(arrTeamIDs, strUsername, callback) {
        const values = [strUsername].concat(arrTeamIDs);
        let teamClause = "link_id IS NULL";
        if (arrTeamIDs.length) {
            teamClause = arrTeamIDs.map((teamID, i) => `link_id = $${i + 2}`).join(" OR ");
        }
        const text = `(
                SELECT * FROM capability_links
                LEFT JOIN ${this.tableName}
                ON capability_links.capability_id = ${this.tableName}.id
                WHERE link_type = 'role'
                AND (
                    link_id IN (
                        SELECT CAST(role_id AS varchar) FROM roles
                        RIGHT JOIN role_links
                        ON roles.id = role_links.role_id
                        WHERE link_type = 'team' AND (${teamClause})
                    )
                    OR
                    link_id IN (
                        SELECT CAST(role_id AS varchar) FROM roles
                        RIGHT JOIN role_links
                        ON roles.id = role_links.role_id
                        WHERE link_type = 'user'
                        AND link_id = $1
                    )
                )
            )
            UNION ALL
            (
                SELECT * FROM capability_links
                LEFT JOIN ${this.tableName}
                ON capability_links.capability_id = ${this.tableName}.id
                WHERE link_type = 'team' AND (${teamClause})
            )
            UNION ALL
            (
                SELECT * FROM capability_links
                LEFT JOIN ${this.tableName}
                ON capability_links.capability_id = ${this.tableName}.id
                WHERE link_type = 'user'
                AND link_id = $1
            )`;
        this.query({ text, values }, callback);
    }

    getContactsByContactType(type, callback) {
        const query =
            `SELECT * FROM contact_types 
            RIGHT JOIN contact ON contact.contact_type_id = contact_types.contact_type_id
            WHERE contact_type = $1;`;
        this.query({ text: query, values: [type] }, callback);
    }
    
    updateContact(data, callback) {
        const query =
            `UPDATE public.contact
            SET 
            contact_type_id = $1,
            contact_name = $2,
            contact_email = $3,
            identifier = $4
            WHERE contact_id = $5`;
        const overwrites = [
            data.contact_type_id,
            data.contact_name,
            data.contact_email,
            data.identifier,
            data.contact_id,
        ];
        this.query({ text: query, values: overwrites }, callback);
    }
    
    addContact(data, callback) {
        const query =
            `INSERT INTO public.contact(contact_type_id, contact_name, contact_email, identifier)
	        VALUES ($1, $2, $3, $4) RETURNING *;`;
        const overwrites = [
            data.contact_type_id,
            data.contact_name,
            data.contact_email,
            data.identifier,
        ];
        this.query({ text: query, values: overwrites }, callback);
    }
    
    deleteContact(data, callback) {
        console.log(data);
        const query =
            `DELETE FROM public.contact
    	    WHERE contact_id = $1`;
        this.query({ text: query, values: [data] }, callback);
    }
}

module.exports = CapabilityModel;
