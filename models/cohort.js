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
        const exclusions = ["FCntDimension", "LCntDimension", "numberSelFlag", "numberSelLtc", "DDimension", "MDimension"];

        // Lookups
        const LTCLookup = [
            { dbname: "chd", displayName: "Coronary Artery Disease" },
            { dbname: "heart_failure", displayName: "Congestive Heart Failure" },
            { dbname: "ckd", displayName: "Chronic Kidney Disease" },
            { dbname: "pad", displayName: "Peripheral Artery Disease" },
        ];
        const FlagLookup = [
            { dbname: "D.other_shielded_category", displayName: "District Shielded", truth: " = 1" },
            { dbname: "D.assisted_collection", displayName: "Assisted Bin Collection", truth: " = 'Y'" },
            { dbname: "D.home_care_link", displayName: "Home Care Link", truth: " IS TRUE" },
            { dbname: "D.single_occupancy", displayName: "Single Occupancy", truth: " = 'Y'" },
            { dbname: "D.disabled_facilities_grant", displayName: "Disabled Facilities Grant", truth: " IS TRUE" },
            { dbname: "D.council_tax", displayName: "Council Tax", truth: " = 'Y'" },
            { dbname: `D."neighbourhood_linked_to_PCN"`, displayName: "Neighbourhood Linked to PCN", truth: " IS TRUE" },
            { dbname: "D.universal_credit", displayName: "Universal Credit", truth: " IS TRUE" },
            { dbname: "D.housing_benefit", displayName: "Housing Benefit", truth: " IS TRUE" },
            { dbname: "D.business_grant", displayName: "Business Grant", truth: " IS TRUE" },
        ];

        // Reusable statements
        const nonestatement = `
            M.asthma IS NOT TRUE AND 
            M.chd IS NOT TRUE AND 
            M.heart_failure IS NOT TRUE AND 
            M.cancer IS NOT TRUE AND 
            M.copd IS NOT TRUE AND 
            M.depression IS NOT TRUE AND 
            M.diabetes IS NOT TRUE AND 
            M.hypertension IS NOT TRUE AND 
            M.atrial_fibrillation IS NOT TRUE AND 
            M.ckd IS NOT TRUE AND 
            M.dementia IS NOT TRUE AND 
            M.epilepsy IS NOT TRUE AND 
            M.hypothyroid IS NOT TRUE AND 
            M.mental_health IS NOT TRUE AND 
            M.learning_disabilities IS NOT TRUE AND 
            M.osteoporosis IS NOT TRUE AND 
            M.pad IS NOT TRUE AND 
            M.rheumatoid_arthritis IS NOT TRUE AND 
            M.stroke_tia IS NOT TRUE AND 
            M.palliative_care_flag IS NOT TRUE AND 
            M.psychotic_disorder_flag IS NOT TRUE AND 
            M.spl IS NOT TRUE AND 
            M.chemo_radiotherapy IS NOT TRUE AND 
            M.haematological_cancers IS NOT TRUE AND 
            M.rare_diseases IS NOT TRUE AND 
            M.respiratory IS NOT TRUE`;
        const noneflagstatement = `
            D.other_shielded_category IS NULL AND 
            D.assisted_collection IS NULL AND 
            D.home_care_link IS NOT TRUE AND 
            D.single_occupancy IS NULL AND 
            D.disabled_facilities_grant IS NOT TRUE AND 
            D.council_tax IS NULL AND 
            D."neighbourhood_linked_to_PCN" IS NOT TRUE AND 
            D.universal_credit IS NOT TRUE AND 
            D.housing_benefit IS NOT TRUE AND 
            D.business_grant IS NOT TRUE`;


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
                MatrixDimension: "",
                Flags2Dimension: ""
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
                        let statement = " (";
                        value.forEach((element) => {
                            const lookup = LTCLookup.filter((x) => x.displayName === element[0]);
                            if (lookup.length > 0) {
                                statement += lookup[0].dbname + " IS TRUE AND ";
                            } else {
                                statement += element[0].toLowerCase().split(" ").join("_") + " IS TRUE AND ";
                            }
                        });
                        return statement.substr(0, statement.length - 4) + ")";
                    }
                },
                Flags2Dimension: (value) => {
                    let noneflag2 = false;
                    value.forEach((element) => {
                        if (element[0] === "None") noneflag2 = true;
                    });
                    if (noneflag2) {
                        return "(" + noneflagstatement + ")";
                    } else {
                        let statement2 = " (";
                        value.forEach((element) => {
                            const lookup = FlagLookup.filter((x) => x.displayName === element[0]);
                            if (lookup.length > 0) {
                                statement2 += lookup[0].dbname + lookup[0].truth + " AND ";
                            } else {
                                statement2 += element[0].toLowerCase().split(" ").join("_") + " IS TRUE AND ";
                            }
                        });
                        return statement2.substr(0, statement2.length - 4) + ")";
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
                }
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
                console.log(convertValuetoSQL(k, ch[k]));
                if (exclusions.indexOf(k) === -1) statement += convertKeytoField(k) + convertValuetoSQL(k, ch[k]) + " AND ";
            });
            statement = statement.substr(0, statement.length - 4);
            return " (" + statement + ") ";
        }
    }
}

module.exports = CohortModel;
