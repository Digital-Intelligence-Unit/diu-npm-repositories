const BaseModel = require('./base/dynamo-db');
const CryptoJs = require('crypto-js');
class Credential extends BaseModel {
    
    tableName = 'credentials';

    create(attributes, callback) {
        //Encrypt function
        const encrypt = (data) => {
            return CryptoJs.AES.encrypt(
                JSON.stringify(data), 
                process.env.JWT_SECRETKEY
            ).toString();
        };

        //Mass create?
        if (!(attributes instanceof Array)) {
            attributes.data = encrypt(attributes.data);
        } else {
            attributes = attributes.map((item) => {
                item.data = encrypt(item.data);
            });
        }

        //Persist
        super.create(attributes, callback);
    }

    update() {}

    getByKeys(tableKeys, callback) {
        super.getByKeys(tableKeys, (err, result) => {
            //Error?
            if(err) { callback(err, null); return; }

            //Decrypt settings
            result.Items = result.Items.map((item) => {
                item.data = JSON.parse(
                    CryptoJs.AES.decrypt(
                        item.data, process.env.JWT_SECRETKEY
                    ).toString(CryptoJs.enc.Utf8)
                );
                return item;
            });

            callback(false, result);
        });
    }
}

module.exports = Credential;