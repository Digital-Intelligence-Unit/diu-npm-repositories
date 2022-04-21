const BaseModel = require('./base/dynamo-db');
const ADClient = require("activedirectory");
const CryptoJs = require('crypto-js');

class ActiveDirectory extends BaseModel {
    
    tableName = 'credentials';

    create(attributes, callback) {
        attributes.data = CryptoJs.AES.encrypt(JSON.stringify(attributes.data), process.env.JWT_SECRETKEY).toString();
        super.create(attributes, callback);
    }

    getInstance(name, callback) {
        //Get the settings from dynamodb
        this.getByKeys({ type: 'ActiveDirectory', name: name }, (err, result) => {
            //Errors
            if(err) { callback(err, null); return; }
            if(result.Items.length == 0) { callback("Unknown organisation", null); return; }

            //Decrypt settings
            let item = result.Items[0];
            let settings = JSON.parse(
                CryptoJs.AES.decrypt(
                    item.data, process.env.JWT_SECRETKEY
                ).toString(CryptoJs.enc.Utf8)
            );

            //Return active directory instance
            callback(null,  new ADClient(
                Object.assign({
                    attributes: {
                        user: [
                            "manager", "distinguishedName", "userPrincipalName",
                            "sAMAccountName", "mail", "lockoutTime", "whenCreated",
                            "pwdLastSet", "userAccountControl", "employeeID",
                            "sn", "givenName", "initials", "cn", "displayName",
                            "comment", "description", "linemanager", "objectSid"
                        ],
                        group: ["distinguishedName", "objectCategory", "cn", "description"],
                    },
                    entryParser(entry, raw, callback) {
                        if (raw.hasOwnProperty("objectGUID")) {
                            entry.objectGUID = raw.objectGUID;
                        }
                        if (raw.hasOwnProperty("objectSid")) {
                            entry.objectSid = raw.objectSid;
                        }
                        callback(entry);
                    }
                }, settings)
            ));
        });
    }
}

module.exports = ActiveDirectory;