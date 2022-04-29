const FastestValidator = require("fastest-validator");
class Validator {
    static check(data, schema, messages = {}) {
        // Create validator instance
        const instance = new FastestValidator({
            useNewCustomCheckerFunction: true,
            messages,
        });

        // Create checker function
        const check = instance.compile(schema);

        // Return status
        const result = check(data);
        if (result === true) {
            return { valid: true };
        } else {
            return { valid: false, errors: result };
        }
    }
}

module.exports = Validator;
