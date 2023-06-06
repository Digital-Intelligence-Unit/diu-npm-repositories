class PermissionsHelper {
    static pbiCapabilitiesAsWhereQuery(prefix, fieldName, user, startingIndex) {
        // Get capabilities by prefix
        const tableCapabilities = user.capabilities.reduce((capabilities, capability) => {
            const key = Object.keys(capability)[0];
            if (key.startsWith(prefix)) {
                capabilities.push(key);
            }
            return capabilities;
        }, []);

        // Create query
        return {
            text: `(${fieldName} IS NULL` + (
                tableCapabilities.length > 0
                    ? ` OR ${fieldName} IN  (
                    ${tableCapabilities.map((v, i) => "$" + (i + (startingIndex || 1)))}
                )`
                    : ""
            ) + ")",
            values: tableCapabilities
        };
    }

    // TO-DO: Ammend functionality similar to above
    static capabilitiesAsSqlQuery(capabilities, capabilityName, table = null, alone = true) {
        let whereclause = "";

        // Check user has capabilities
        if (capabilities.length > 0) {
            capabilities.forEach((role) => {
                const item = JSON.stringify(role);
                const keys = Object.keys(role);

                // Check if related to table
                if (item.includes(capabilityName + "_")) {
                    // Add constraint to query
                    if (keys.length > 1) {
                        let current = null;
                        whereclause += "(";
                        keys.forEach((k) => {
                            if (k.includes(capabilityName + "_")) {
                                current = (table !== null ? table + "." : "") + k.replace(capabilityName + "_", "");
                                whereclause +=
                                    (table !== null ? table + "." : "") +
                                    k.replace(capabilityName + "_", "") +
                                    " like '" + role[k] + "' AND ";
                            } else {
                                whereclause += current + " like '" + role[k] + "' AND ";
                            }
                        });
                        whereclause = whereclause.substr(0, whereclause.length - 4);
                        whereclause += ") OR ";
                    } else {
                        whereclause +=
                            (table !== null ? table + "." : "") +
                            keys[0].replace(capabilityName + "_", "") +
                            " like '" + role[keys[0]] + "'";
                        whereclause += " OR ";
                    }
                }
            });

            // Remove extra AND/OR
            if (whereclause.length > 0) {
                whereclause = whereclause.substr(0, whereclause.length - 4);
            }
        }

        // Prepare for adjoinment?
        if (whereclause.length > 0) {
            if (alone) {
                whereclause = " WHERE " + whereclause;
            } else {
                whereclause = "(" + whereclause + ") AND ";
            }
        }

        return whereclause;
    }
}

module.exports = PermissionsHelper;
