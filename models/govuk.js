const BaseModel = require('./base/postgres');
const CredentialModel = require("./credential");
class GovUkModel extends BaseModel {

    tableName = '';

    update(item, callback) {
        console.info("GOV UK Notify ACK---Receipt: " + JSON.stringify(item));
        // Log status against messageid === id
        const updatequery = `UPDATE public.virtualward_lightertouchpathway SET status='Message ` + item.status + `' WHERE messageid = '` + item.id + `'`;
        this.query(updatequery, (err, res) => {
            if (err) console.error("ERROR:" + err + " --- Query:" + updatequery);
            // Update log table with messagecount based on info from receipt and Services
            CredentialModel({
                type: 'GovUkService', 
                name: item.template_id
            }, (err, result) => {
                if(err) { callback(err, null); return; }

                const service = result.Items[0];
                const servicecountlogquery = "INSERT INTO public.virtualward_servicecountlog (messageid, msgcount, organisation, servicename, type, period) VALUES ($1, $2, $3, $4, $5, $6)";
                const values = [item.id, service.msgcount, service.organisation, service.name, item.notification_type, item.sent_at];
                this.query(servicecountlogquery, values, (innerErr, innerRes) => {
                    if (innerErr) console.error("ERROR:" + innerErr + " --- Query:" + servicecountlogquery);
                    callback(null, "success");
                });
            });
        });
    }

    getAllServiceCountLogs = function (callback) {
        const query = `SELECT logs.*, pathway.status FROM public.virtualward_servicecountlog as logs LEFT OUTER JOIN public.virtualward_lightertouchpathway as pathway ON logs.messageid = pathway.messageid`;
        this.query(query, (error, results) => {
          if (error) {
            console.error("Error: " + error);
            callback(null, "Error:" + error);
          } else if (results && results.rows) {
            callback(null, results.rows);
          } else {
            callback(null, []);
          }
        });
    }

    updateGeneral = function (service, item, callback) {
        console.info("GOV UK Notify ACK---Receipt: " + JSON.stringify(item));
        const servicecountlogquery = "INSERT INTO public.notify_callbacks (messageid, msgcount, organisation, servicename, type, period, templateid, status, recipient) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
        const values = [item.id, service.msgcount, service.organisation, service.name, item.notification_type, item.sent_at, item.template_id, item.status, item.to];
        this.query(servicecountlogquery, values, (innerErr, innerRes) => {
          if (innerErr) console.error("ERROR:" + innerErr + " --- Query:" + servicecountlogquery);
          callback(null, "success");
        });
    }
}

module.exports = GovUkModel;