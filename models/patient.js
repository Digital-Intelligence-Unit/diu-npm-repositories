const BaseModel = require("./base/postgres");
// const PermissionsHelper = require("../helpers/permissions");
class PatientModel extends BaseModel {
    tableName = "population_master";

    getByCaseload(caseloadId, user, filters = {}, callback) {
        // Check user permissions
        // const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(user.capabilities, "populationjoined", "D");
        // if (rolecheck === "" || rolecheck === "error") {
        //     callback(new Error("Invalid Permissions"), null, {
        //         reason: "Access denied. Insufficient permissions to view any patients details.",
        //     });
        //     return;
        // }

        // Get patients realting to caseload
        const query = `
            SELECT M.*, D.*
            FROM public.population_master M
            LEFT JOIN public.district_master D using(nhs_number)
            RIGHT JOIN public.caseload_patients CP
            ON patient_id = nhs_number
            WHERE caseload_id = $1 LIMIT 1 OFFSET $2`;

        // Make query
        this.query({
            text: query,
            values: [caseloadId, ((filters.page || 1) - 1) * 100]
        }, callback);
    }
}

module.exports = PatientModel;
