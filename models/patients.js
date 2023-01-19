// @ts-check
const BaseModel = require("./base/postgres");
const PermissionsHelper = require("../helpers/permissions");
const CohortModel = require("./cohort");

class PatientsModel extends BaseModel {
    selectjoin = `SELECT
    M.*,
    D.local_authority_name as D_local_authority_name, D.gpp_code as D_gpp_code,
    D.practice as D_practice, D.age as D_age, D.age_category as D_age_category,
    D.sex as D_sex, D.date_of_birth as D_date_of_birth, D.date_of_death as D_date_of_death,
    D.title as D_title, D.forename as D_forename, D.other_forenames as D_other_forenames,
    D.surname as D_surname, D.address_line_1 as D_address_line_1, D.address_line_2 as D_address_line_2,
    D.address_line_3 as D_address_line_3, D.address_line_4 as D_address_line_4, D.address_line_5 as D_address_line_5,
    D.postcode as D_postcode, D.ward_name as D_ward_name, D.landline as D_landline, D.mobile as D_mobile,
    D.other_shielded_category as D_other_shielded_category, D.assisted_collection as D_assisted_collection,
    D.home_care_link as D_home_care_link, D.single_occupancy as D_single_occupancy, D.number_of_occupants as D_number_of_occupants,
    D.disabled_facilities_grant as D_disabled_facilities_grant, D.council_tax as D_council_tax,
    D."neighbourhood_linked_to_PCN" as D_neighbourhood_linked_to_PCN,
    D.universal_credit as D_universal_credit, D.housing_benefit as D_housing_benefit,
    D.business_grant as D_business_grant, D.result as D_result,
    D.reason as D_reason, D.contact_date as D_contact_date, D.district as D_district,
    D.etl_run_date as D_etl_run_date, D.nhs_number as D_nhs_number
    FROM
    public.population_master M
    LEFT JOIN public.district_master D
    using(nhs_number)`;

    getAll(limit, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", true);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            const query = this.selectjoin + rolecheck + " LIMIT " + limit;
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

    getAllByCohort(limit, cohort, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", false);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            const query = this.selectjoin + " WHERE " + rolecheck + CohortModel.cohortUrlAsSqlQuery(cohort) + " LIMIT " + limit;
            this.query(query, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, "Error:" + error, null);
                } else if (results && results.rows) {
                    callback(null, null, results.rows);
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
            const query = this.selectjoin + " WHERE " + rolecheck + ` "nhs_number" = '` + nhsnumber + "'";
            this.query(query, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, error, null);
                } else if (results && results.rows && results.rows.length > 0) {
                    callback(null, null, results.rows);
                } else {
                    this.getHistoryByNHSNumber(nhsnumber, roles, callback);
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
                " WHERE " +
                rolecheck +
                ` "nhs_number" = '` +
                nhsnumber +
                "'";
            this.query(query, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, error, null);
                } else if (results && results.rows) {
                    callback(null, null, results.rows);
                } else {
                    callback(null, "No rows returned", null);
                }
            });
        }
    }

    findMyNHSNumber(resource, callback) {
        let query =
            `SELECT nhs_number FROM public.population_master WHERE "sex"='` +
            resource.gender.substring(0, 1) +
            `' AND "postcode"='` +
            resource.postcode +
            `' AND "date_of_birth"='` +
            resource.dob +
            "' LIMIT 1;";
        if (resource.forename) {
            query =
                `SELECT nhs_number FROM public.population_master WHERE "sex"='` +
                resource.gender.substring(0, 1) +
                `' AND "forename" ILIKE '` +
                resource.forename +
                `' AND "postcode"='` +
                resource.postcode +
                `' AND "date_of_birth"='` +
                resource.dob +
                "' LIMIT 1;";
        }
        this.query(query, (error, results) => {
            if (error) {
                console.log("Error: " + error);
                callback(error, null);
            } else if (results && results.rows.length > 0) {
                callback(null, results.rows);
            } else {
                this.checkHistoryTableforNHSNumber(resource, callback);
            }
        });
    }

    checkHistoryTableforNHSNumber(resource, callback) {
        let query =
            `SELECT nhs_number FROM public.population_history WHERE "sex"='` +
            resource.gender.substring(0, 1) +
            `' AND "postcode"='` +
            resource.postcode +
            `' AND "date_of_birth"='` +
            resource.dob +
            `' LIMIT 1;`;
        if (resource.forename) {
            query =
                `SELECT nhs_number FROM public.population_history WHERE "sex"='` +
                resource.gender.substring(0, 1) +
                `' AND "forename" ILIKE '` +
                resource.forename +
                `' AND "postcode"='` +
                resource.postcode +
                `' AND "date_of_birth"='` +
                resource.dob +
                "' LIMIT 1;";
        }
        this.query(query, (error, results) => {
            if (error) {
                console.log("Error: " + error);
                callback(error, null);
            } else if (results && results.rows.length > 0) {
                callback(null, results.rows);
            } else {
                callback(new Error("No rows returned"), null);
            }
        });
    }
}

module.exports = PatientsModel;
