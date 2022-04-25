const JWT = require("jsonwebtoken");
const Validator = require("./validator");
class Middleware {
    static authenticate(type) {
        return (req, res, next) => {

        }
    }

    static authenticateWithKey(key) {
        return (req, res, next) => {
            try {
                if (req.headers.authorization && req.headers.authorization === key) {
                    next();
                } else {
                    //throw "Invalid API key";
                    res.status(401).json({ error: "Invalid API key" });
                }
            } catch {
                res.status(401).json({ error: "Invalid request" });
            }
        }
    }

    static checkOrigin(req, res, next) {
        //Get origin
        const origin = req.headers.referer;

        //Check origin
        if (origin.includes("localhost") || origin.includes(process.env.SITE_URL || ".")) {
            next();
        } else {
            console.log("Unknown referer attempted to create a role: " + origin);
            res.status(400).json({ success: false, msg: "Unknown referer" });
        }
    }

    static validate(dataType, schema, messages = {}) {
        return (req, res, next) => {
            const status = Validator.check(req[dataType], schema, messages);
            if(status.valid) {
                next();
            } else {
                res.status(400).json({ success: false, msg: status.errors[0].message });
            }
        }
    }

    static userHasCapability(capabilities) {
        return (req, res, next) => {
            try {
                //Handle string input
                capabilities = !(capabilities instanceof Array) ? [capabilities] : capabilities;

                //Parse JWT from user
                let user = JWT.decode(req.header("authorization").replace("JWT ", ""));
                let userCapabilities = user.capabilities.map((item) => Object.keys(item)[0]);
                let userAuthorised = true;

                //Create access log
                let accessLogs = [];
                capabilities.forEach((capability) => {
                    //Check if capability authorised
                    let capabilityAuthorised = userCapabilities.includes(capability);
                    userAuthorised = (userAuthorised == false) ? false : capabilityAuthorised;
                    
                    //Add log
                    accessLogs.push({
                        type: `Capability${capabilityAuthorised ? 'Authorised' : 'Unauthorised'}#${capability}`,
                        user: {
                            username: user.username,
                            organisation: user.organisation
                        },
                        data: { capability: capability }
                    });
                });
                
                //Persist logs and respond
                const AccessLogModel = new (require("../models/access-log"))();
                AccessLogModel.create(accessLogs, (err) => {
                    if (err) { console.log(err); }; 
                    if(userAuthorised) {
                        next();
                    } else {
                        res.status(401).json({ success: false, msg: "You're unauthorised to make this request!" });
                    }
                });
            } catch(e) {
                res.status(401).json({ success: false, msg: "An error occurred authorising your request" });
            }
        }
    }
}

module.exports = Middleware;