const BaseModel = require('./base/postgres');
class CapabilityModel extends BaseModel {

    tableName = 'capabilities';

    getByTag(tagName,callback) {
        let query = `SELECT * FROM ${this.tableName} WHERE $1 = ANY(tags)`;
        this.query({text:query, values:[tagName]}, callback);
    }
    
    getByTagsAnd(tagArray,callback) {
        if(tagArray.length){
            let query = `SELECT * FROM ${this.tableName}`;
            let tagCounter = 0;
            tagArray.forEach(tagName => {
                if(tagCounter){
                    query += ` AND $${(tagCounter+1)} = ANY(tags)`;
                } else {
                    query += ` WHERE $${(tagCounter+1)} = ANY(tags)`;
                }
                tagCounter++;
            });
            this.query({text:query, values:tagArray}, callback);
        }
    }
    
    getByTagsOr(tagArray,callback) {
        if(tagArray.length){
            let query = `SELECT * FROM ${this.tableName}`;
            let tagCounter = 0;
            tagArray.forEach(tagName => {
                if(tagCounter){
                    query += ` OR $${(tagCounter+1)} = ANY(tags)`;
                } else {
                    query += ` WHERE $${(tagCounter+1)} = ANY(tags)`;
                }
                tagCounter++;
            });
            this.query({text:query, values:tagArray}, callback);
        }
    }

    getByLinkId(type, type_id, callback) {
        this.query({
            text: `SELECT ${this.tableName}.*, capability_links.link_type, capability_links.link_id FROM ${this.tableName} RIGHT JOIN capability_links ON capabilities.id = capability_links.capability_id WHERE link_type = $1 AND link_id = $2`,
            values: [type, type_id.toString()]
        }, callback);
    }

    getByLinkIds(type, type_ids, callback) {
        let query = `SELECT ${this.tableName}.*, capability_links.link_type, capability_links.link_id
                     FROM ${this.tableName} RIGHT JOIN capability_links ON ${this.tableName}.id = capability_links.capability_id 
                     WHERE link_type = $1 AND link_id IN (` + type_ids.map((u, i) => "$" + (i + 2)) + ")";
        this.query({ text: query, values: [type].concat(type_ids) }, callback);
    }
    
    //Not sure one the use case for this...?
    getAllCapabilitiesFromTeamArrayAndUserID(arrTeamIDs, strUsername, callback) {
        if(arrTeamIDs.length && strUsername){
            let query = `(
                SELECT * FROM capability_links
                LEFT JOIN ${this.tableName}
                ON capability_links.capability_id = ${this.tableName}.id
                WHERE link_type = 'role'
                AND ( 
                    link_id IN (
                        SELECT CAST(role_id AS varchar) FROM roles
                        RIGHT JOIN role_links
                        ON roles.id = role_links.role_id
                        WHERE link_type = 'team'`
                        let teamCounter = 0;
                        arrTeamIDs.forEach(teamID => {
                            if(teamCounter){
                                query += ` OR link_id = $${(teamCounter+1)}`;
                            } else {
                                query += ` AND (link_id = $${(teamCounter+1)}`;
                            }
                            teamCounter++;
                        });
                        query += `)
                    )
                    OR 
                    link_id IN (
                        SELECT CAST(role_id AS varchar) FROM roles
                        RIGHT JOIN role_links
                        ON roles.id = role_links.role_id
                        WHERE link_type = 'user'
                        AND link_id = $3
                    )
                )
            )
            UNION ALL
            (	
                SELECT * FROM capability_links
                LEFT JOIN ${this.tableName}
                ON capability_links.capability_id = ${this.tableName}.id
                WHERE link_type = 'team'`;
                teamCounter = 0;
                arrTeamIDs.forEach(teamID => {
                    if(teamCounter){
                        query += ` OR link_id = $${(teamCounter+1)}`;
                    } else {
                        query += ` AND (link_id = $${(teamCounter+1)}`;
                    }
                    teamCounter++;
                });
                query += `)
            )
            UNION ALL
            (	
                SELECT * FROM capability_links
                LEFT JOIN ${this.tableName}
                ON capability_links.capability_id = ${this.tableName}.id
                WHERE link_type = 'user'
                AND link_id = $3
            )`;
            arrTeamIDs.push(strUsername);
            this.query({text:query, values:arrTeamIDs}, callback);
        }
    }
    
}   

module.exports = CapabilityModel;