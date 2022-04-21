//Methods
const Methods = {
  DynamoDBData: require("./dynamodb").All,
  Generic: require("./generic").All,
  Postgresql: require("./postgres").All,
}

//Models
const Models = {
  UserModel: require("./models/user"),
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
  OrganisationModel: require("./models/organisation"),

  ActiveDirectoryModel: require("./models/active-directory"),
  ConfluenceModel: require("./models/confluence"),
  ClinicalTrialModel: require("./models/clinical-trial"),

  //To be removed
  UserRoleModel: require("./models/user-role"),
  TeamRoleModel: require("./models/team-role"),
}

//Helpers
const Helpers = {
  Hash: require("./helpers/hash"),
  Aws: require("./helpers/aws"),
  String: require("./helpers/string"),
  Middleware: require("./helpers/middleware"),
  Email: require("./helpers/email")
}

//Exports
module.exports = { Methods: Methods, Models: Models, Helpers: Helpers };