// @ts-check
const BaseModel = require("./base/postgres");
const PermissionsHelper = require("../helpers/permissions");
const CohortModel = require("./cohort");

class PatientsModel extends BaseModel {
    selectjoin = `SELECT M.sex,M.age,M.risk_score_int,M.asthma,M.copd,M.chd,M.heart_failure,
    M.hypertension,M.atrial_fibrillation,M.pad,M.cancer,M.depression,M.dementia,M.mental_health,M.learning_disabilities,M.diabetes,
    M.hypothyroid,M.ckd,M.epilepsy,M.osteoporosis,M.rheumatoid_arthritis,M.execution_date, M.testdigest, M.wellbeing_acorn_type,
    M.household_group,M.household_type,M.mosaic_label,M.gpp_code FROM population_master as M`;

    getAll(limit, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", true);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            const query = this.selectjoin + rolecheck + ` ORDER BY "nhs_number" LIMIT ` + limit;
            this.query(query, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, "Error:" + error, null);
                } else if (results && results.length > 0) {
                    callback(null, null, results);
                } else {
                    callback(null, "No rows returned", null);
                }
            });
        }
    }

    getAllByCohort(queryParams, cohort, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", false);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            let query = this.selectjoin;
            if (cohort) {
                query += " WHERE " + CohortModel.cohortUrlAsSqlQuery(cohort);
            }
            console.log(query);
            this.queryWithParams(query, queryParams, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, "Error:" + error, null);
                } else if (results && results.length > 0) {
                    callback(null, null, results);
                } else {
                    callback(null, "No rows returned", null);
                }
            });
        }
    }

    getPersonByNHSNumber(nhsnumber, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", false);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            const query = this.selectjoin + " WHERE " + rolecheck + " nhs_number = $1";
            this.query({ text: query, values: [nhsnumber] }, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, error, null);
                } else if (results && results.length > 0) {
                    callback(null, null, results);
                } else {
                    this.getHistoryByNHSNumber(nhsnumber, roles, callback);
                }
            });
        }
    }

    getPersonByDigest(digest, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", false);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            const query = this.selectjoin + " WHERE " + rolecheck + " testdigest = $1 LIMIT 1";
            console.log(query);
            this.query({ text: query, values: [digest] }, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, error, null);
                } else if (results && results.length > 0) {
                    callback(null, null, results);
                } else {
                    callback(null, "Could not find your patient", null);
                }
            });
        }
    }

    getHistoryByNHSNumber(nhsnumber, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", false);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            const query =
            this.selectjoin.replace("public.population_master", "public.population_history") +
            " WHERE " + rolecheck + "nhs_number = $1";
            this.query({ text: query, values: [nhsnumber] }, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, error, null);
                } else if (results && results.length > 0) {
                    callback(null, null, results);
                } else {
                    callback(null, "No rows returned", null);
                }
            });
        }
    }

    findMyNHSNumber(resource, callback) {
        let query;
        if (resource.forename) {
            query = {
                text: `
                    SELECT nhs_number FROM public.population_master 
                    WHERE "sex" = $1 AND "forename" ILIKE $2 AND "postcode" = $3 AND "date_of_birth" = $4 LIMIT 1;`,
                values: [resource.gender.substring(0, 1), resource.forename, resource.postcode, resource.dob]
            };
        } else {
            query = {
                text: `
                    SELECT nhs_number FROM public.population_master 
                    WHERE "sex" = $1 AND "postcode" = $2 AND "date_of_birth" = $3 LIMIT 1;`,
                values: [resource.gender.substring(0, 1), resource.postcode, resource.dob]
            };
        }

        // Make request
        this.query(query, (error, results) => {
            if (error) {
                console.log("Error: " + error);
                callback(error, null);
            } else if (results && results.length > 0) {
                callback(null, results);
            } else {
                this.checkHistoryTableforNHSNumber(resource, callback);
            }
        });
    }

    checkHistoryTableforNHSNumber(resource, callback) {
        let query;
        if (resource.forename) {
            query = {
                text: `
                    SELECT nhs_number FROM public.population_history 
                    WHERE "sex" = $1 AND "forename" ILIKE $2 AND "postcode" = $3 AND "date_of_birth" = $4 LIMIT 1;`,
                values: [resource.gender.substring(0, 1), resource.forename, resource.postcode, resource.dob]
            };
        } else {
            query = {
                text: `
                    SELECT nhs_number FROM public.population_history
                    WHERE "sex" = $1 AND "postcode" = $2 AND "date_of_birth" = $3 LIMIT 1;`,
                values: [resource.gender.substring(0, 1), resource.postcode, resource.dob]
            };
        }

        // Make request
        this.query(query, (error, results) => {
            if (error) {
                console.log("Error: " + error);
                callback(error, null);
            } else if (results && results.length > 0) {
                callback(null, results);
            } else {
                this.checkHistoryTableforNHSNumber(resource, callback);
            }
        });
    }
}

module.exports = PatientsModel;
