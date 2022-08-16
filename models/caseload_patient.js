const BaseModel = require("./base/postgres");
const PermissionsHelper = require("../helpers/permissions");
const CohortModel = require("./cohort");
const CaseloadModel = require("./caseload");

class CaseloadPatient extends BaseModel {
    tableName = "caseload_patients";

    create(attributes, callback) {
        super.create(attributes, (createError) => {
            // Handle error
            if (createError) {
                callback(createError);
                return;
            }

            // Increment caseload total
            (new CaseloadModel()).updateTotal({
                id: attributes.caseload_id,
                count: 1,
                operator: "+",
            }, callback);
        });
    }

    createByPatientIds(attributes, callback) {
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

            // Create rows
            super.create(
                attributes.patientids.map((id) => {
                    return { caseload_id: attributes.caseload_id, patient_id: id };
                }),
                (createError, createResponse) => {
                    // Handle error
                    if (createError) { callback(createError); }

                    // Update caseload total
                    (new CaseloadModel()).updateTotal({
                        id: attributes.caseload_id,
                        count: attributes.patientids.length,
                        operator: "="
                    }, callback);
                }
            );
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
                capabilities, "populationjoined", "M", false
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
                }, (getTotalError, getTotalRes) => {
                    // Handle error
                    if (getTotalError) { callback(getTotalError); }

                    // Update caseload total
                    (new CaseloadModel()).updateTotal({
                        id: attributes.caseload_id,
                        count: parseInt(getTotalRes[0].total),
                        operator: "="
                    }, callback);
                });
            });
        });
    }

    updateByPrimaryKey() {}

    deleteByPrimaryKey() {}

    deleteByPatientId(keys, callback) {
        this.query({
            text: `DELETE FROM caseload_patients WHERE caseload_id = $1 AND patient_id = $2 RETURNING *`,
            values: [keys.caseload_id, keys.patient_id]
        }, (deleteError, result) => {
            // Handle error
            if (deleteError) {
                callback(deleteError);
                return;
            }

            // Decrement caseload total
            (new CaseloadModel()).updateTotal({
                id: keys.caseload_id,
                count: 1,
                operator: "-"
            }, callback);
        });
    }

    deleteByCaseloadId(caseloadId, callback) {
        // Make update
        this.query({
            text: `DELETE FROM ${this.tableName} WHERE caseload_id = $1 RETURNING *`,
            values: [caseloadId]
        }, callback);
    }
}

module.exports = CaseloadPatient;
