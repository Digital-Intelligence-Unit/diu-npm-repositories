const BaseModel = require("./base/dynamo-db");
class AtomicFormDataModel extends BaseModel {
    tableName = "atomic_formdata";
}

module.exports = AtomicFormDataModel;
