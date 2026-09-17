// utils/crypto.ts

// Normalize phone numbers to standard format before hashing
export async function hashPhone(phone: string): Promise<string> {
  const cleaned = phone.replace(/[^\d+]/g, ""); // Keep only numbers and '+'
  return sha256(cleaned);
}

// Normalize email to lowercase before hashing
export async function hashEmail(email: string): Promise<string> {
  const cleaned = email.trim().toLowerCase();
  return sha256(cleaned);
}

async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}