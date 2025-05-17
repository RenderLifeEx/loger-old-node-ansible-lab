module.exports = {
    apps: [
        {
            name: "logger-old-node-backend",
            script: "app.js",
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3003,
            },
        },
    ],
};
