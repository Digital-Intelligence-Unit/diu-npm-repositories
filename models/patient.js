const BaseModel = require("./base/postgres");
const PermissionsHelper = require("../helpers/permissions");
class PatientModel extends BaseModel {
    tableName = "population_master";

    sensitiveColumns = {
        age: "#",
        nhs_number: "#",
        address_line_1: "#",
        address_line_2: "#",
        address_line_3: "#",
        address_line_4: "#",
        address_line_5: "#",
        postcode: "#",
        forename: "#",
        other_forenames: "#",
        surname: "#",
        date_of_birth: "#",
        landline: "#",
        mobile: "#"
    };

    filterableColumns = [
        "gpp_code", "practice", "ccg_code", "ccg", "icp", "age", "age_group", "age_category", "sex",
        "risk_score", "risk_score_int", "rs_frailty", "rs_frailty_index", "rs_total_ltcs", "housebound",
        "palliative_care", "community_matron_status", "community_matron_type", "community_matron_status_type",
        "community_matron", "pcn", "lsoa", "lsoa_name", "nhs_number", "address_line_1", "address_line_2",
        "address_line_3", "address_line_4", "address_line_5", "postcode", "forename",
        "surname", "electoral_ward_or_division", "ward_name", "residential_institution",
        "date_of_birth", "ics", "asthma", "chd", "heart_failure", "cancer", "copd", "depression", "diabetes", "hypertension",
        "atrial_fibrillation", "ckd", "dementia", "epilepsy", "hypothyroid", "mental_health", "learning_disabilities",
        "osteoporosis", "pad", "rheumatoid_arthritis", "stroke_tia", "palliative_care_flag", "smoker", "substance_misuse",
        "psychotic_disorder_flag", "cdiff_flag", "oxygen_flag", "care_plan_flag", "dispensing_flag", "spl", "chemo_radiotherapy",
        "haematological_cancers", "pregnant_with_congenital_heart_defect", "rare_diseases", "respiratory", "transplant",
        "deceased_flag", "covid_risk", "covid_vuln"
    ];

    create() {}; update() {}; delete() {};

    getByCaseload(caseloadId, user, filters = {}, callback) {
        // Check user permissions
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(user.capabilities, "populationjoined", "M");
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
            return;
        }

        // Get supplied filters
        const filterColumns = Object.keys(filters).filter((key) => {
            return this.filterableColumns.includes(key);
        });

        // Create filters query
        let filtersQuery = "";
        if (filterColumns.length > 0) {
            filtersQuery += "AND (";
            filterColumns.forEach((column, index) => {
                filtersQuery += `M.${column} = $${index + 3} AND `;
            });
            filtersQuery = filtersQuery.slice(0, -5) + ") ";
        }

        // Get patients relating to caseload
        const query = `
            SELECT M.*
            FROM public.population_master M
            RIGHT JOIN public.caseload_patients CP
            ON patient_id = nhs_number
            WHERE CP.caseload_id = $1 ${filtersQuery}LIMIT 100 OFFSET $2`;

        // Make query
        this.query({
            text: query,
            values: [caseloadId, ((filters.page || 1) - 1) * 100].concat(Object.values(filters))
        }, (getError, patients) => {
            // Handle error
            if (getError) { callback(getError); }
            callback(null, this._hideSensitiveColumns(user, patients));
        });
    }

    _hideSensitiveColumns(user, data) {
        return user.mfa
            ? data
            : data.map(patient => {
                return Object.assign({}, patient, this.sensitiveColumns);
            });
    }
}

module.exports = PatientModel;
