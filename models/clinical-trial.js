const BaseModel = require("./base/postgres");
class ClinicalTrialModel extends BaseModel {
    constructor(pool = null) {
        super(pool || require("../config/database").connections.clinicaltrials);
    }

    get(callback) {
        this.query(
            `
            SELECT
                s.nct_id,
                CONCAT('https://clinicaltrials.gov/ct2/show/study/', s.nct_id) AS url,
                start_date,
                completion_date,
                study_type,
                official_title,
                COALESCE(REPLACE(phase, 'N/A', 'Not Applicable'), 'Not Applicable') AS study_phase,
                enrollment,
                gender,
                description,
                REPLACE(minimum_age, 'N/A', '0 Years') AS min_age,
                COALESCE(NULLIF(regexp_replace(minimum_age, '\\D','','g'), '')::numeric, 0) AS min_age_number,
                REPLACE(maximum_age, 'N/A', '500 Years') AS max_age,
                COALESCE(NULLIF(regexp_replace(maximum_age, '\\D','','g'), '')::numeric, 500) AS max_age_number,
                conditions
            FROM
                ctgov.studies s
            LEFT JOIN ctgov.eligibilities e ON e.nct_id = s.nct_id
            LEFT JOIN ctgov.brief_summaries b ON b.nct_id = s.nct_id
            LEFT JOIN (
                SELECT
                    nct_id,
                    STRING_AGG(downcase_name, ', ') AS conditions
                FROM
                    ctgov.conditions
                GROUP BY
                    nct_id
            ) c ON c.nct_id = s.nct_id
            WHERE
                overall_status = 'Completed'
                AND ( enrollment IS NOT NULL OR enrollment > 0)
                    ORDER BY enrollment DESC
                limit 1000`,
            callback
        );
    }

    getSearchTop1000(query, phases, minDate, callback) {
        const parsedQuery = this.extractfromCohort(query, phases, minDate);
        this.query(
            `SELECT
                s.nct_id,
                CONCAT('https://clinicaltrials.gov/ct2/show/study/', s.nct_id) AS url,
                start_date,
                completion_date,
                study_type,
                official_title,
                COALESCE(REPLACE(phase, 'N/A', 'Not Applicable'), 'Not Applicable') AS study_phase,
                enrollment,
                gender,
                description,
                REPLACE(minimum_age, 'N/A', '0 Years') AS min_age,
                COALESCE(NULLIF(regexp_replace(minimum_age, '\\D','','g'), '')::numeric, 0) AS min_age_number,
                REPLACE(maximum_age, 'N/A', '500 Years') AS max_age,
                COALESCE(NULLIF(regexp_replace(maximum_age, '\\D','','g'), '')::numeric, 500) AS max_age_number,
                conditions
            FROM
            ctgov.studies s
            LEFT JOIN ctgov.eligibilities e ON e.nct_id = s.nct_id
            LEFT JOIN ctgov.brief_summaries b ON b.nct_id = s.nct_id
            LEFT JOIN (
            SELECT
                nct_id,
                STRING_AGG(downcase_name, ', ') AS conditions
            FROM
                ctgov.conditions
            GROUP BY
                nct_id
            ) c ON c.nct_id = s.nct_id
            WHERE
            overall_status = 'Completed'
            ` +
                parsedQuery +
                `
                AND ( enrollment IS NOT NULL OR enrollment > 0)
                    ORDER BY enrollment DESC
            limit 1000`,
            callback
        );
    }

    extractfromCohort(cohorturl, phases, minDate) {
        let builtquery = " AND completion_date >= now() - interval '" + minDate + " year' ";

        if (phases.split(",").length > 0) {
            builtquery += " AND (";
            phases.split(",").forEach((val) => {
                if (val === "not_applicable") {
                    builtquery += " COALESCE(REPLACE(phase, 'N/A', 'Not Applicable'), 'Not Applicable') LIKE '%ot Applicabl%' OR ";
                } else builtquery += " phase LIKE '%" + val + "%' OR ";
            });
            builtquery = builtquery.substr(0, builtquery.length - 3);
            builtquery += ") ";
        }

        const parsedCohort = JSON.parse(cohorturl);
        // check for gender (SexDimension)
        if (parsedCohort["SexDimension"] && parsedCohort["SexDimension"].length === 1) {
            if (parsedCohort["SexDimension"].indexOf("Female")) {
                builtquery += " AND gender = 'Male' ";
            } else {
                builtquery += " AND gender = 'Female' ";
            }
        }
        // check for age (AgeDimension)
        if (parsedCohort["AgeDimension"]) {
            builtquery +=
                " AND (COALESCE(NULLIF(regexp_replace(minimum_age, '\\D','','g'), '')::numeric, 0) >= " +
                parsedCohort["AgeDimension"][0][0];
            builtquery +=
                " AND COALESCE(NULLIF(regexp_replace(maximum_age, '\\D','','g'), '')::numeric, 0) <= " +
                parsedCohort["AgeDimension"][0][1] +
                ") ";
        }
        // check for conditions (LTCs2Dimension)
        if (parsedCohort["LTCs2Dimension"]) {
            parsedCohort["LTCs2Dimension"].forEach((element) => {
                builtquery += " AND conditions LIKE '%, " + element.toString().toLowerCase() + ",%' ";
            });
        }
        return builtquery;
    }
}

module.exports = ClinicalTrialModel;
