/**
 * Session Security Utilities
 *
 * Provides HMAC signing and verification for session cookies
 * to prevent tampering on the client side.
 */

import { createHmac } from "crypto";

// Secret key for signing - should be in env in production
const SESSION_SECRET = process.env.SESSION_SECRET || "timeflow-demo-secret-key-2024-change-in-production";

/**
 * Sign data with HMAC-SHA256
 */
export function signData(data: string): string {
  const hmac = createHmac("sha256", SESSION_SECRET);
  hmac.update(data);
  return hmac.digest("hex");
}

/**
 * Create a signed session string
 * Format: base64(data).signature
 */
export function createSignedSession(sessionData: object): string {
  const jsonData = JSON.stringify(sessionData);
  const base64Data = Buffer.from(jsonData).toString("base64");
  const signature = signData(base64Data);
  return `${base64Data}.${signature}`;
}

/**
 * Verify and parse a signed session
 * Returns null if signature is invalid or data is corrupted
 */
export function verifyAndParseSession<T>(signedSession: string): T | null {
  try {
    const parts = signedSession.split(".");
    if (parts.length !== 2) {
      return null;
    }

    const [base64Data, signature] = parts;

    // Verify signature
    const expectedSignature = signData(base64Data);
    if (signature !== expectedSignature) {
      console.warn("Session signature verification failed");
      return null;
    }

    // Parse data
    const jsonData = Buffer.from(base64Data, "base64").toString("utf-8");
    const data = JSON.parse(jsonData) as T;

    return data;
  } catch (error) {
    console.error("Session parsing error:", error);
    return null;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password requirements
 * - Minimum 8 characters
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: "Le mot de passe doit contenir au moins 8 caractères" };
  }
  return { valid: true };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts?: number; retryAfter?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Check if locked out
  if (attempts.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment attempts
  loginAttempts.set(identifier, { count: attempts.count + 1, lastAttempt: now });
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count - 1 };
}

export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}
