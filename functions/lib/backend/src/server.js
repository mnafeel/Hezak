"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = require("./app");
const server = app_1.app.listen(env_1.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 API server ready at http://localhost:${env_1.env.PORT}`);
});
const shutdown = () => {
    server.close(() => {
        // eslint-disable-next-line no-console
        console.log('🛑 Server closed gracefully');
        process.exit(0);
    });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
//# sourceMappingURL=server.js.map