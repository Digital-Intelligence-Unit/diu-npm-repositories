const BaseModel = require("./base/postgres");
const PermissionsHelper = require("../helpers/permissions");
const CohortModel = require("./cohort");

class CaseloadPatient extends BaseModel {
    tableName = "caseload_patients";

    createByCohort(attributes, capabilities = [], callback) {
        // Create query
        const query = `
        INSERT INTO ${this.tableName} (caseload_id, patient_id)
        SELECT $1, nhs_number as nhs_number
        FROM public.population_master M
        WHERE ` + PermissionsHelper.capabilitiesAsSqlQuery(
            false, capabilities, "populationjoined"
        ) + CohortModel.cohortUrlAsSqlQuery(attributes.cohorturl);

        // Insert
        this.query({
            text: query,
            values: [attributes.caseload_id]
        }, callback);
    }
}

module.exports = CaseloadPatient;
