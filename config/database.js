const pg = require("pg");
const config = { connections: {} };

// Add postgres date parser
pg.types.setTypeParser(pg.types.builtins.DATE, (stringValue) => {
    return new Date(stringValue);
});

// Add default postgres
config.connections.postgres = new pg.Pool({
    database: "postgres",
    host: process.env.PGDATABASE || "localhost",
    user: process.env.POSTGRES_UN,
    password: process.env.POSTGRES_PW,
    port: process.env.PGPORT || "5432",
});

// Add clinical trials postgres
config.connections.clinicaltrials = new pg.Pool({
    user: "morgans3",
    host: "aact-db.ctti-clinicaltrials.org",
    database: "aact",
    password: process.env.NICEAPI_KEY,
    port: "5432",
});

// Add dynamodb
const AWS = require("aws-sdk");
AWS.config.region = process.env.AWSREGION || "eu-west-2";
AWS.config.credentials = new AWS.Credentials({
    accessKeyId: process.env.AWS_SECRETID,
    secretAccessKey: process.env.AWS_SECRETKEY,
});
config.connections.dynamodb = AWS;

// Export config
module.exports = config;
