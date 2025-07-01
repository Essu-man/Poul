"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createtasks = void 0;
exports.createtasks = "\nCREATE TABLE tasks (\n    id SERIAL PRIMARY KEY,\n    name TEXT NOT NULL,\n    time TEXT NOT NULL,\n    priority TEXT NOT NULL,\n    icon TEXT NOT NULL,\n    color TEXT NOT NULL,\n    completed INTEGER NOT NULL DEFAULT 0,\n    created_at TIMESTAMP DEFAULT NOW()\n);\n";
