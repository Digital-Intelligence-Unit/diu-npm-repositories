const JWT = require("jsonwebtoken");
const Validator = require("./validator");
class Middleware {
    static authenticate(type) {
        return (req, res, next) => {};
    }

    static authenticateWithKey(key) {
        return (req, res, next) => {
            try {
                if (req.headers.authorization && req.headers.authorization === key) {
                    next();
                } else {
                    // throw "Invalid API key";
                    res.status(401).json({ error: "Invalid API key" });
                }
            } catch {
                res.status(401).json({ error: "Invalid request" });
            }
        };
    }

    static checkOrigin(req, res, next) {
        // Get origin
        const origin = req.headers.referer;

        // Check origin
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
            if (status.valid) {
                next();
            } else {
                res.status(400).json({ success: false, msg: status.errors[0].message });
            }
        };
    }

    static userHasCapability(capabilities) {
        return (req, res, next) => {
            try {
                // Handle string input
                capabilities = !(capabilities instanceof Array) ? [capabilities] : capabilities;

                // Parse JWT from user
                const user = JWT.decode(req.header("authorization").replace("JWT ", ""));
                const userCapabilities = user.capabilities.map((item) => Object.keys(item)[0]);
                let userAuthorised = false;
                let authorisedCapability = capabilities.slice(-1).pop(); // Default to last capability

                // Initialise access log
                const accessLogs = [];

                capabilities.forEach((capability) => {
                    // Check if capability authorised
                    if (userCapabilities.includes(capability)) {
                        userAuthorised = true;
                        authorisedCapability = capability;
                    }
                });

                // Create access log
                accessLogs.push({
                    type: `Capability${userAuthorised ? "Authorised" : "Unauthorised"}#${authorisedCapability}`,
                    user: {
                        username: user.username,
                        organisation: user.organisation,
                    },
                    data: { authorisedCapability },
                });

                // Persist logs and respond
                const AccessLogModel = new (require("../models/access-log"))();
                AccessLogModel.create(accessLogs, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    if (userAuthorised) {
                        next();
                    } else {
                        res.status(403).json({
                            success: false,
                            msg: "You're unauthorised to make this request!",
                            data: capabilities
                        });
                    }
                });
            } catch (e) {
                res.status(500).json({ success: false, msg: "An error occurred authorising your request" });
            }
        };
    }
}

module.exports = Middleware;
