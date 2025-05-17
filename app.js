const express = require("express");
const winston = require("winston");
const fs = require("fs");
const path = require("path");

// Для Winston 2.x
require("winston-daily-rotate-file");

// Создаем папку logs, если ее нет
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Настройка логгера для Winston 2.x
const logger = new winston.Logger({
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(logsDir, "application.log"),
            datePattern: ".yyyy-MM-dd",
            prepend: true,
            json: false,
            timestamp: function () {
                return new Date().toISOString();
            },
            formatter: function (options) {
                return [
                    options.timestamp(),
                    options.level.toUpperCase(),
                    options.message || "",
                    options.meta && Object.keys(options.meta).length
                        ? JSON.stringify(options.meta)
                        : "",
                ].join(" ");
            },
        }),
        new winston.transports.Console({
            timestamp: function () {
                return new Date().toISOString();
            },
            formatter: function (options) {
                return [
                    options.timestamp(),
                    options.level.toUpperCase(),
                    options.message || "",
                    options.meta && Object.keys(options.meta).length
                        ? JSON.stringify(options.meta)
                        : "",
                ].join(" ");
            },
        }),
    ],
});

const app = express();

// Получаем порт из переменных окружения или используем 3000 по умолчанию
const PORT = process.env.PORT || 3001;

// Middleware для логирования запросов
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Эндпоинт для логирования
app.get("/log", (req, res) => {
    const message = req.query.message || "No message provided";
    const level = req.query.level || "info";

    logger.log(level, message, {
        ip: req.ip,
        endpoint: "/log",
    });

    res.json({
        status: "success",
        message: `Logged: ${message}`,
        level: level,
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        node_env: process.env.NODE_ENV,
        port: PORT,
        timestamp: new Date().toISOString(),
    });
});

// Обработка 404
app.use((req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        status: "error",
        message: "Not Found",
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    logger.error("Server error:", {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
    });

    res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
});

// Старт сервера
app.listen(PORT, () => {
    logger.info(
        `Server started in ${process.env.NODE_ENV || "development"} mode`
    );
    logger.info(`Listening on port ${PORT}`);
    logger.info(`PM2 logs will be saved to ${logsDir}/pm2-{out,error}.log`);
});

// Обработка завершения процесса
process.on("SIGINT", () => {
    logger.info("SIGINT received. Shutting down gracefully...");
    process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
});
