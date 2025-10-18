import * as fs from 'fs';
import * as path from 'path';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const logDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)

const logFormat = format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] [${level.toUpperCase().padEnd(7)}] ${message}`;
})

export const logger = createLogger({
    level: 'debug',
    format: format.combine(format.timestamp(), logFormat),
    transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
            filename: path.join(logDir, 'access-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            zippedArchive: true,
        }),
    ],
});
