// Methods
const Methods = {
    DynamoDBData: require("./dynamodb").All,
    Generic: require("./generic").All,
    Postgresql: require("./postgres").All,
};

// Models
const Models = {
    UserModel: require("./models/user"),
    UserProfileModel: require("./models/user-profile"),
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
    CVICohortModel: require("./models/cvicohort"),
    AtomicFormDataModel: require("./models/atomic-formdata"),
    AtomicPayloadsModel: require("./models/atomic-payloads"),
    SpiIncidentMethods: require("./models/spi_incident_methods"),
    RealTimeSurveillance: require("./models/real-time-surveillance"),

    ActiveDirectoryModel: require("./models/active-directory"),
    ConfluenceModel: require("./models/confluence"),
    ClinicalTrialModel: require("./models/clinical-trial"),
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
};

// Exports
module.exports = { Methods, Models, Helpers };
