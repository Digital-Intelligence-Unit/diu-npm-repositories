# About
This is a custom client for querying apache pinot using AdonisJs' lucid

# Installation
Import the pinot client in your config/database.ts
```
import { PinotClient } from '../app/helpers/pinot-dialect.js'
```

Configure a new client for pinot
```
const dbConfig = defineConfig({
  connection: 'pinot',
  connections: {
    pinot: {
      client: PinotClient,
      dialectName: 'mysql',
      connection: {
        broker: 'https://broker_url:PORT',
      },
    }
  },
})
```

Use patch package to make ammendment to adonisjs at @adonisjs/lucid/build/src/connection/index.js
```
export class Connection extends EventEmitter {
         this.config = config;
         this.logger = logger;
         this.validateConfig();
-        this.dialectName = resolveClientNameWithAliases(this.config.client);
+        this.dialectName = this.config.dialectName || resolveClientNameWithAliases(this.config.client);
         this.hasReadWriteReplicas = !!(this.config.replicas &&
             this.config.replicas.read &&
             this.config.replicas.write);
```