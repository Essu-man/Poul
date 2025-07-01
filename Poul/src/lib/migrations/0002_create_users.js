"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsers = void 0;
exports.createUsers = "\nCREATE TABLE users (\n    id TEXT PRIMARY KEY,\n    email TEXT UNIQUE NOT NULL,\n    role TEXT NOT NULL DEFAULT 'employee',\n    name TEXT,\n    created_at TIMESTAMP DEFAULT NOW()\n);\n";
