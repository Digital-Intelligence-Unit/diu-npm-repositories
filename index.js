// Methods
const Methods = {
    DynamoDBData: require("./dynamodb").All,
    Generic: require("./generic").All,
    Postgresql: require("./postgres").All,
};

// Models
const Models = {
    BaseDDBModel: require("./models/base/dynamo-db"),
    BasePostgresModel: require("./models/base/postgres"),

    UserModel: require("./models/user"),
    UserProfileModel: require("./models/user-profile"),
    UserSettingsModel: require("./models/user-settings"),
    FormSubmissionModel: require("./models/form-submission"),
    VerificationCodeModel: require("./models/verification-code"),

    RoleModel: require("./models/role"),
    RoleLinkModel: require("./models/role-link"),
    CapabilityModel: require("./models/capability"),
    CapabilityLinkModel: require("./models/capability-link"),
    CapabilityTagModel: require("./models/capability-tag"),
    AccessLog: require("./models/access-log"),
    AccessLogStatistic: require("./models/access-log-statistic"),
    TeamModel: require("./models/team"),
    TeamMemberModel: require("./models/team-member"),
    OrganisationModel: require("./models/organisation"),
    CredentialModel: require("./models/credential"),
    GovUkModel: require("./models/govuk"),
    CohortModel: require("./models/cohort"),
    CaseloadModel: require("./models/caseload"),
    CaseloadPatientModel: require("./models/caseload_patient"),
    PatientModel: require("./models/patient"),
    PatientsModel: require("./models/patients"),
    CVICohortModel: require("./models/cvicohort"),
    AtomicFormDataModel: require("./models/atomic-formdata"),
    AtomicPayloadsModel: require("./models/atomic-payloads"),
    SpiIncidentMethods: require("./models/spi_incident_methods"),
    RealTimeSurveillance: require("./models/real-time-surveillance"),
    MLCSUUsersModel: require("./models/mlcsu-users"),
    TrustsAndSitesModel: require("./models/trusts-and-sites"),

    ActiveDirectoryModel: require("./models/active-directory"),
    ConfluenceModel: require("./models/confluence"),
    ClinicalTrialModel: require("./models/clinical-trial"),

    PBICategory: require("./models/pbi-category"),
    PBIMetric: require("./models/pbi-metric"),
    PBIMetricData: require("./models/pbi-metric-data"),
    PBIMetricLevel: require("./models/pbi-metric-level"),
    PBIView: require("./models/pbi-view"),
    PBIMetricDashboard: require("./models/pbi-metric-dashboards"),
    PBIGeography: require("./models/pbi-geography"),
    PBIUploader: require("./models/pbi-uploader"),
    Job: require("./models/job")
};

// Helpers
const Helpers = {
    Hash: require("./helpers/hash"),
    Aws: require("./helpers/aws"),
    StringMethods: require("./helpers/string"),
    Middleware: require("./helpers/middleware"),
    Email: require("./helpers/email"),
    Validator: require("./helpers/validator"),
    MsTeams: require("./helpers/ms-teams"),
    Permissions: require("./helpers/permissions"),
    S3: require("./helpers/s3")
};

// Exports
module.exports = { Methods, Models, Helpers };
