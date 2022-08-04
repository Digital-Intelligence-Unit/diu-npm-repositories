class PermissionsHelper {
    static capabilitiesAsSqlQuery(alone, userroles, table) {
        let whereclause = "";
        if (userroles.length > 0) {
            userroles.forEach((role) => {
                const item = JSON.stringify(role);
                const keys = Object.keys(role);
                if (item.includes(table + "_")) {
                    if (keys.length > 1) {
                        let current = null;
                        whereclause += "(";
                        keys.forEach((k) => {
                            if (k.includes(table + "_")) {
                                current = k.replace(table + "_", "");
                                whereclause += k.replace(table + "_", "") + " like '" + role[k] + "' AND ";
                            } else {
                                whereclause += current + " like '" + role[k] + "' AND ";
                            }
                        });
                        whereclause = whereclause.substr(0, whereclause.length - 4);
                        whereclause += ") OR ";
                    } else {
                        whereclause += keys[0].replace(table + "_", "") + " like '" + role[keys[0]] + "'";
                        whereclause += " OR ";
                    }
                }
            });
            if (whereclause.length > 0) {
                whereclause = whereclause.substr(0, whereclause.length - 4);
            }
        }

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
