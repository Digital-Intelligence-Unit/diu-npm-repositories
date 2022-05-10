const BaseModel = require("./base/secrets");
const ADClient = require("activedirectory");
const Aws = require("./helpers/aws");

class ActiveDirectory extends BaseModel {
    tableName = "credentials";

    create(attributes, callback) {
        callback(new Error("Not implemented. Requires additions via AWS infrastructure (routing tables, secrets manager)"), null);
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
            Aws.getSecretsAsync(item.name, (errGetSecret, data) => {
                if (errGetSecret) {
                    callback(errGetSecret, null);
                } else {
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
                                data
                            )
                        )
                    );
                }
            });
        });
    }
}

module.exports = ActiveDirectory;
