module.exports = {
    apps: [
        {
            name: "logger-old-node-backend",
            script: "app.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3003,
            },
            log_date_format: "YYYY-MM-DD HH:mm:ss",
            error_file: "./logs/pm2-error.log",
            out_file: "./logs/pm2-out.log",
            combine_logs: true,
        },
    ],
};
