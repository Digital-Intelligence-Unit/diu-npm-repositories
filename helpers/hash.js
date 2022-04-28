const bcryptjs = require("bcryptjs")
class Hash {
    static make (plainText) {
        return bcryptjs.hashSync(plainText, bcryptjs.genSaltSync(10))
    }

    static check (plainText, hash, callback) {
        // To-do
        return bcryptjs.compare(plainText, hash, callback)
    }
}

module.exports = Hash
