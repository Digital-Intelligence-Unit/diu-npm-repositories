const BaseModel = require("./base/postgres");
const PermissionsHelper = require("../helpers/permissions");
const CohortModel = require("./cohort");

class CaseloadPatient extends BaseModel {
    tableName = "caseload_patients";

    create(attributes, callback) {
        // Delete existing
        this.query({
            text: `DELETE FROM ${this.tableName} WHERE caseload_id = $1`,
            values: [attributes.caseload_id]
        }, (error) => {
            // Return error
            if (error) {
                callback(error);
                return;
            }

            super.create(attributes, callback);
        });
    }

    createByCohort(attributes, capabilities = [], callback) {
        // Delete existing
        this.query({
            text: `DELETE FROM ${this.tableName} WHERE caseload_id = $1`,
            values: [attributes.caseload_id]
        }, (deleteError) => {
            // Return error
            if (deleteError) {
                callback(deleteError);
                return;
            }

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
            }, (createError) => {
                // Return error
                if (createError) {
                    callback(createError);
                    return;
                }

                // Get number of rows inserted
                this.query({
                    text: `
                    SELECT count(*) as total FROM ${this.tableName}
                    WHERE caseload_id = $1`,
                    values: [attributes.caseload_id]
                }, callback);
            });
        });
    }

    deleteByCaseloadId(caseloadId, callback) {
        // Make update
        this.query({
            text: `DELETE FROM ${this.tableName} WHERE caseload_id = $1 RETURNING *`,
            values: [caseloadId]
        }, (err, result) => {
            callback(err, result || null);
        });
    }
}

module.exports = CaseloadPatient;
