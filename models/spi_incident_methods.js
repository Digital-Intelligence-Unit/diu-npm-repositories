const BaseModel = require("./base/dynamo-db");
class SpiIncidentMethods extends BaseModel {
    tableName = "spi_incidentmethods";
}

module.exports = SpiIncidentMethods;
