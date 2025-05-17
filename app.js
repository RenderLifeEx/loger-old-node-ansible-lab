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
const PORT = 3003;

// Эндпоинт для логирования
app.get("/log", (req, res) => {
    const message = req.query.message || "No message provided";
    const level = req.query.level || "info";

    logger.log(level, message, {
        ip: req.ip,
    });

    res.send(`Logged: ${message} with level ${level}`);
});

// Старт сервера
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.info(`Server started on port ${PORT}`);
});
