/* eslint-disable no-fallthrough */
const BaseModel = require("./base/dynamo-db");
const uuid = require("uuid");
class CohortModel extends BaseModel {
    tableName = "cohorts";

    accessor(attributes) {
        attributes.id = uuid.v1();
        return attributes;
    }

    create(attributes, callback) {
        // Is array?
        if (!(attributes instanceof Array)) {
            // Create single
            super.create(this.accessor(attributes), callback);
        } else {
            // Loop and edit
            attributes.forEach((model, index, models) => {
                models[index] = this.accessor(model);
            });

            // Batch create
            super.create(attributes, callback);
        }
    }

    get(params, callback) {
        // Initialise query
        const query = { TableName: this.tableName };

        // Has filters?
        if (Object.values(params).length > 0) {
            query.ExpressionAttributeNames = {};
            query.ExpressionAttributeValues = {};
            query.FilterExpression = [];
        }

        // Filter by cohort name
        if (params.name) {
            query.FilterExpression.push("#cohortName = :cohortName");
            query.ExpressionAttributeNames["#cohortName"] = "cohortName";
            query.ExpressionAttributeValues[":cohortName"] = params.name;
        }

        // Filter by username
        if (params.username) {
            query.FilterExpression.push("#user = :user");
            query.ExpressionAttributeNames["#user"] = "user";
            query.ExpressionAttributeValues[":user"] = params.username;
        }

        // Filter by teamcode
        if (params.teamcode) {
            query.FilterExpression.push("#teamcode = :teamcode");
            query.ExpressionAttributeNames["#teamcode"] = "teamcode";
            query.ExpressionAttributeValues[":teamcode"] = params.teamcode;
        }

        // Join filters
        if (query.FilterExpression) {
            query.FilterExpression = query.FilterExpression.join(" and ");
        }

        // Run query
        this.documentClient.scan(query, callback);
    }

    static cohortUrlAsSqlQuery(cohorturl) {
        // Exclude fields
        const exclusions = ["FCntDimension", "numberSelFlag", "numberSelLtc"];

        // Lookups
        const LTCLookup = [
            { dbname: "asthma", displayName: "Asthma" },
            { dbname: "copd", displayName: "COPD" },
            { dbname: "chd", displayName: "Coronary Artery Disease" },
            { dbname: "heart_failure", displayName: "Congestive Heart Failure" },
            { dbname: "hypertension", displayName: "Hypertension" },
            { dbname: "atrial_fibrillation", displayName: "Atrial Fibrillation" },
            { dbname: "pad", displayName: "Peripheral Artery Disease" },
            { dbname: "cancer", displayName: "Cancer" },
            { dbname: "depression", displayName: "Depression" },
            { dbname: "dementia", displayName: "Dementia" },
            { dbname: "mental_health", displayName: "Mental Health" },
            { dbname: "learning_disabilities", displayName: "Learning Disabilities" },
            { dbname: "diabetes", displayName: "Diabetes" },
            { dbname: "hypothyroid", displayName: "Hypothyroid" },
            { dbname: "ckd", displayName: "Chronic Kidney Disease" },
            { dbname: "epilepsy", displayName: "Epilepsy" },
            { dbname: "osteoporosis", displayName: "Osteoporosis" },
            { dbname: "rheumatoid_arthritis", displayName: "Rheumatoid Arthritis" },
        ];
        const FlagLookup = [
            { dbname: "M.frailty_text", displayName: "Frailty - Mild", value: "Mild" },
            { dbname: "M.frailty_text", displayName: "Frailty - Moderate", value: "Moderate" },
            { dbname: "M.frailty_text", displayName: "Frailty - Severe", value: "Severe" },
        ];
        // Reusable statements
        const nonestatement = LTCLookup.map((item, index) => {
            return "M." + item.dbname + " IS NOT TRUE";
        }).join(" AND ");
        const noneflagstatement = `M.frailty_text = ""`;

        // Key to field name
        const convertKeytoField = (dimensionName) => {
            const fieldKeys = {
                SexDimension: "M.sex",
                AgeDimension: "M.age",
                RskDimension: "M.risk_score_int",
                WDimension: "M.electoral_ward_or_division",
                GPDimension: "M.gpp_code",
                LDimension: "M.pcn",
                CCGDimension: "M.ccg_code",
                LTCs2Dimension: "",
                LCntDimension: "",
                MatrixDimension: "",
                Flags2Dimension: "",
                DDimension: "M.deprivation_decile",
                MDimension: "M.mosaic_label",
                ADimension: "M.household_type",
                DUDimension: "M.du",
                LADimension: "M.local_authority",
            };
            return fieldKeys.hasOwnProperty(dimensionName) ? fieldKeys[dimensionName] : "nhs_number";
        };

        // Value to SQL query
        const convertValuetoSQL = (dimensionName, fieldValue) => {
            // Array to sql
            const arrayToSql = (array) => {
                if (array.length === 0) return " IS NOT NULL ";
                else if (array.length === 1) return " = '" + array[0] + "'";
                else {
                    let list = " in (";
                    array.forEach((element) => {
                        list += "'" + element + "',";
                    });
                    return list.substr(0, list.length - 1) + ")";
                }
            };

            const arrayToSqlAcorn = (array) => {
                if (array.length === 0) return " IS NOT NULL ";
                else if (array.length === 1) return " = '" + array[0] + "'";
                else {
                    let list = " in (";
                    array.forEach((element) => {
                        list += "'" + element.slice(1) + "',";
                    });
                    return list.substr(0, list.length - 1) + ")";
                }
            };

            // Map fields to function
            const fieldValueMap = {
                SexDimension: (value) => {
                    // Change values
                    value = value.map((sex) => {
                        return sex.length > 1 ? sex.slice(0, 1) : sex;
                    });
                    return arrayToSql(value);
                },
                LDimension: arrayToSql,
                GPDimension: arrayToSql,
                WDimension: arrayToSql,
                CCGDimension: arrayToSql,
                DDimension: arrayToSql,
                MDimension: arrayToSql,
                DUDimension: arrayToSql,
                LADimension: arrayToSql,
                ADimension: arrayToSqlAcorn,
                LCntDimension: (value) => {
                    const LTCStatement = LTCLookup.map((item, index) => {
                        return "cast(" + item.dbname + " as integer)";
                    }).join(" + ");
                    const arrStatements = value.map((data, index) => {
                        let operator = " = ";
                        if (data.trim() === "5") {
                            operator = " >= ";
                        }
                        return "((" + LTCStatement + ") " + operator + data + ")";
                    });
                    return "(" + arrStatements.join(" OR ") + ")";
                },
                AgeDimension: (value) => {
                    return " >= " + value[0][0] + " AND M.age <= " + value[0][1];
                },
                RskDimension: (value) => {
                    return " >= " + value[0][0] + " AND M.risk_score_int <= " + value[0][1];
                },
                LTCs2Dimension: (value) => {
                    let noneflag = false;
                    value.forEach((element) => {
                        if (element[0] === "None") noneflag = true;
                    });
                    if (noneflag) {
                        return "(" + nonestatement + ")";
                    } else {
                        const allData = JSON.parse(cohorturl);
                        let statement = " (";
                        value.forEach((element) => {
                            const lookup = LTCLookup.filter((x) => x.displayName === element);
                            if (lookup.length > 0) {
                                statement += "cast(" + lookup[0].dbname + " as integer) + ";
                            } else {
                                statement += "cast(" + element.toLowerCase().split(" ").join("_") + " as integer) + ";
                            }
                        });
                        statement = statement.substr(0, statement.length - 2) + getLtcSelected(allData) + ")";
                        return statement;
                    }
                },
                Flags2Dimension: (value) => {
                    let noneflag = false;
                    value.forEach((element) => {
                        if (element[0] === "None") noneflag = true;
                    });
                    if (noneflag) {
                        return "(" + noneflagstatement + ")";
                    } else {
                        let statement = "(";
                        value.forEach(element => {
                            const lookup = FlagLookup.filter((x) => x.displayName === element);
                            if (lookup.length > 0) {
                                if (statement === "(") {
                                    statement += lookup[0].dbname + " = " + "'" + lookup[0].value + "'";
                                } else {
                                    statement += " AND " + lookup[0].dbname + " = " + "'" + lookup[0].value + "'";
                                }
                            }
                        });
                        statement += ")";
                        return statement;
                    }
                },
                MatrixDimension: (value) => {
                    let whereClause = "";
                    value.forEach((valuePair, i) => {
                        if (valuePair[0] && valuePair[1]) {
                            whereClause += `covid_risk like '${valuePair[0]}' AND covid_vuln like '${valuePair[1]}'`;
                            // Not the first pair and not the last do we add the `AND`
                            if (value.length > 1 && i !== value.length - 1) {
                                whereClause += " AND ";
                            }
                        }
                    });
                    whereClause = ` (${whereClause}) `;
                    return whereClause;
                },
            };

            const getLtcSelected = (allData) => {
                if (allData["numberSelLtc"] && allData["numberSelLtc"].length > 0) {
                    return " IN (" + allData["numberSelLtc"].join(",") + ")";
                }
                return " > 0";
            };
            return fieldValueMap.hasOwnProperty(dimensionName) ? fieldValueMap[dimensionName](fieldValue) : " = '0000000000'";
        };

        // Convert url to query
        if (cohorturl === "" || cohorturl === null || cohorturl === "{}") {
            return "";
        } else {
            let statement = "";
            const ch = JSON.parse(cohorturl);
            const keys = Object.keys(ch);
            keys.forEach((k) => {
                if (exclusions.indexOf(k) === -1) statement += convertKeytoField(k) + convertValuetoSQL(k, ch[k]) + " AND ";
            });
            statement = statement.substr(0, statement.length - 4);
            return " (" + statement + ") ";
        }
    }
}

module.exports = CohortModel;
