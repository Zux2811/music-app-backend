// src/config/security.js
// Central place to access security-related constants. Server startup validates
// JWT_SECRET; other modules should import from here instead of reading
// process.env directly.

import dotenv from 'dotenv';
// Ensure env is loaded even if this file is imported independently
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET ?? "";

