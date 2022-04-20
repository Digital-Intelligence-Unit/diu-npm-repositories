const Hash = require("../helpers/hash");
const BaseModel = require("./base/dynamo-db");
class UserModel extends BaseModel {
  tableName = "users";

  //To-do: deprecate method
  addUser(newUser, password, callback) {
    newUser["password"] = { S: Hash.make(password) };
    new this.AWS.DynamoDB().putItem(
      {
        TableName: this.tableName,
        Item: newUser,
      },
      callback
    );
  }

  create(attributes, callback) {
    //Hash password
    if (attributes.password) {
      attributes.password = Hash.make(password);
    }

    //Run base create
    super.create(attributes, callback);
  }

  updateOrCreate(keys, attributes, callback) {
    this.documentClient.query(
      {
        TableName: this.tableName,
        KeyConditionExpression: "#username = :username and #organisation = :organisation",
        ExpressionAttributeNames: {
          "#username": "username",
          "#organisation": "organisation",
        },
        ExpressionAttributeValues: {
          ":username": keys.username,
          ":organisation": keys.organisation,
        },
      },
      (err, data) => {
        //Error occurred
        console.log(err, keys);
        if (err) {
          callback(err, null);
          return;
        }

        //Create or update?
        if (data.Count == 0) {
          attributes = Object.assign(attributes, keys);
          this.create(attributes, callback);
        } else {
          this.update(keys, attributes, callback);
        }
      }
    );
  }

  getUserByUsername(username, callback) {
    var params = {
      TableName: this.tableName,
      KeyConditionExpression: "#username = :username",
      ProjectionExpression: "#username, #name, #email, #password, #organisation, #password_expires, #linemanager",
      ExpressionAttributeNames: {
        "#username": "username",
        "#email": "email",
        "#name": "name",
        "#password": "password",
        "#password_expires": "password_expires",
        "#organisation": "organisation",
        "#linemanager": "linemanager",
      },
      ExpressionAttributeValues: {
        ":username": username,
      },
    };
    this.documentClient.query(params, callback);
  }

  getUserByPartialUsername(username, callback) {
    var params = {
      TableName: this.tableName,
      IndexName: "username-index",
      KeyConditionExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":username": username,
      },
    };
    this.documentClient.query(params, callback);
  }

  getByEmail(email, organisation, callback) {
    var params = {
      TableName: this.tableName,
      IndexName: "email-index",
      KeyConditionExpression: "#email = :email",
      FilterExpression: "#organisation = :organisation",
      ExpressionAttributeNames: {
        "#email": "email",
        "#organisation": "organisation",
      },
      ExpressionAttributeValues: {
        ":email": email,
        ":organisation": organisation,
      },
    };
    this.documentClient.query(params, callback);
  }

  updateUser(username, newpassword, callback) {
    this.getUserByUsername(username, (err, res) => {
      //Set user
      const user = res.Items[0];

      //Generate password expiry
      let passwordExpires = new Date();
      passwordExpires.setDate(passwordExpires.getDate() + 150);

      //Update password & expiry
      var params = {
        TableName: this.tableName,
        Key: {
          username: user.username,
          organisation: user.organisation,
        },
        UpdateExpression: "set #password = :password, #password_expires = :password_expires",
        ExpressionAttributeNames: {
          "#password": "password",
          "#password_expires": "password_expires",
        },
        ExpressionAttributeValues: {
          ":password": Hash.make(newpassword),
          ":password_expires": passwordExpires.toISOString(),
        },
        ReturnValues: "UPDATED_NEW",
      };

      // @ts-ignore
      this.documentClient.update(params, (updateErr, updateRes) => {
        callback(updateErr, res.Items[0]);
      });
    });
  }

  // hasRole(username, role) {}

  // hasCapability(username, capability) {}

  delete(keys, callback) {
    const RoleLinkModel = new (require("./role-link"))();
    const CapabilityLinkModel = new (require("./capability-link"))();

    //Delete linked roles
    RoleLinkModel.deleteByLinkId("user", `${keys.username}#${keys.organisation}`, (err, result) => {
      if (err) {
        callback("Error executing query", null);
        return;
      }

      //Delete linked capabilities
      CapabilityLinkModel.deleteByLinkId("user", `${keys.username}#${keys.organisation}`, (err, result) => {
        if (err) {
          callback("Error executing query", null);
          return;
        }

        //Delete user
        super.delete(keys, callback);
      });
    });
  }
}

module.exports = UserModel;
