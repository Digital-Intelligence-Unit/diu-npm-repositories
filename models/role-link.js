const BaseModel = require("./base/postgres");
class RoleLinkModel extends BaseModel {
  tableName = "role_links";

  link(roles, metadata, callback) {
    //Get existing rows
    this.getByLinkId(metadata.type, metadata.id, (err, links) => {
      //Create new links
      let currentRoles = links.map((l) => l.role_id);
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
                callback("Error executing query", null);
                return;
              }
            }
          );
        });

      //Delete old links
      let oldRoles = links.filter((l) => !roles.includes(l.role_id));
      if (oldRoles.length > 0) {
        this.query(
          {
            text: `DELETE FROM ${this.tableName} WHERE id IN (${oldRoles.map((l) => l.id).join(",")})`,
          },
          (error) => {
            if (error) {
              callback("Error executing query", null);
              return;
            }
          }
        );
      }

      callback(null, roles);
    });
  }

  getByLinkId(type, type_id, callback) {
    this.query(
      {
        text: `SELECT * FROM ${this.tableName} WHERE link_type = $1 AND link_id = $2`,
        values: [type, type_id],
      },
      callback
    );
  }

  deleteByLinkable(role_id, type, type_id, callback) {
    this.query(
      {
        text: `DELETE FROM ${this.tableName} WHERE role_id = $1 AND link_type = $2 AND link_id = $3`,
        values: [role_id, type, type_id],
      },
      callback
    );
  }

  deleteByLinkId(type, type_id, callback) {
    this.query(
      {
        text: `DELETE FROM ${this.tableName} WHERE link_type = $1 AND link_id = $2`,
        values: [type, type_id],
      },
      callback
    );
  }
}

module.exports = RoleLinkModel;
