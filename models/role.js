const BaseModel = require('./base/postgres');
class RoleModel extends BaseModel {

    tableName = 'roles';

    getByPrimaryKey(id, callback) {
        //Select all
        this.query({
            text: `SELECT *, array(
                SELECT capability_id FROM capability_links WHERE link_type = 'role' and link_id = $1
            ) as capabilities FROM ${this.tableName} WHERE id = $2`,
            values: [id.toString(), id]
        }, (err, result) => {
            callback(err, result ? result[0] : null);
        });
    }
    
    getByName(name, callback) {
        //Select all
        this.query({
            text: `SELECT * FROM ${this.tableName} WHERE name = $1`,
            values: [name]
        }, (err, result) => {
            callback(err, result);
        });
    }

    getByLinkId(type, type_id, callback) {
        this.query({
            text: `SELECT ${this.tableName}.*, role_links.link_type, role_links.link_id FROM ${this.tableName} RIGHT JOIN role_links ON roles.id = role_links.role_id WHERE link_type = $1 AND link_id = $2`,
            values: [type, type_id.toString()]
        }, callback);
    }

    getByLinkIds(type, type_ids, callback) {
        let query = `SELECT ${this.tableName}.*, role_links.link_type, role_links.link_id 
                     FROM ${this.tableName} RIGHT JOIN role_links ON roles.id = role_links.role_id 
                     WHERE link_type = $1 AND link_id IN (` + type_ids.map((u, i) => "$" + (i + 2)) + ")";
        this.query({ text: query, values: [type].concat(type_ids) }, callback);
    }

    deleteByPrimaryKey(primaryKeyValue, callback) {
        //Delete capability links
        this.query({
            text: `DELETE FROM capability_links WHERE link_type = 'role' and link_id = $1;`,
            values: [primaryKeyValue.toString()]
        }, (err, result) => {});
        
        //Delete role
        this.query({
            text: `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
            values: [primaryKeyValue]
        }, callback);
    }

    //Not sure on use case for this...?
    getLinksByTeamName(arrTeamNames, callback) {
        let query = `SELECT * FROM ${this.tableName} RIGHT JOIN role_links on ${this.tableName}.id = role_links.role_id WHERE link_type = 'team'`;
        let teamCounter = 0;
        arrTeamNames.forEach(teamName => {
            if(teamCounter){
                query += ` OR link_id = $${(teamCounter+1)}`;
            } else {
                query += ` AND (link_id = $${(teamCounter+1)}`;
            }
            teamCounter++;
        });
        query += `);`;
        this.query({
            text: query,
            values: arrTeamNames
        }, (err, result) => {
            callback(err, result);
        });
    }
}

module.exports = RoleModel;