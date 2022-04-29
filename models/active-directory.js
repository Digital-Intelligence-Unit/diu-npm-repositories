const BaseModel = require("./base/dynamo-db");
const ADClient = require("activedirectory");
const CryptoJs = require("crypto-js");

class ActiveDirectory extends BaseModel {
    tableName = "credentials";

    create(attributes, callback) {
        attributes.data = CryptoJs.AES.encrypt(JSON.stringify(attributes.data), process.env.JWT_SECRETKEY).toString();
        super.create(attributes, callback);
    }

    getInstance(name, callback) {
        // Get the settings from dynamodb
        this.getByKeys({ type: "ActiveDirectory", name }, (err, result) => {
            // Errors
            if (err) {
                callback(err, null);
                return;
            }
            if (result.Items.length === 0) {
                const errResponse = "Unknown organisation";
                callback(errResponse, null);
                return;
            }

            // Decrypt settings
            const item = result.Items[0];
            const settings = JSON.parse(CryptoJs.AES.decrypt(item.data, process.env.JWT_SECRETKEY).toString(CryptoJs.enc.Utf8));

            // Return active directory instance
            callback(
                null,
                new ADClient(
                    Object.assign(
                        {
                            attributes: {
                                user: [
                                    "manager",
                                    "distinguishedName",
                                    "userPrincipalName",
                                    "sAMAccountName",
                                    "mail",
                                    "lockoutTime",
                                    "whenCreated",
                                    "pwdLastSet",
                                    "userAccountControl",
                                    "employeeID",
                                    "sn",
                                    "givenName",
                                    "initials",
                                    "cn",
                                    "displayName",
                                    "comment",
                                    "description",
                                    "linemanager",
                                    "objectSid",
                                ],
                                group: ["distinguishedName", "objectCategory", "cn", "description"],
                            },
                            entryParser(entry, raw, innerCallback) {
                                if (raw.hasOwnProperty("objectGUID")) {
                                    entry.objectGUID = raw.objectGUID;
                                }
                                if (raw.hasOwnProperty("objectSid")) {
                                    entry.objectSid = raw.objectSid;
                                }
                                innerCallback(entry);
                            },
                        },
                        settings
                    )
                )
            );
        });
    }
}

module.exports = ActiveDirectory;
