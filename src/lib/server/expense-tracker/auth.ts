import { EXPENSE_TRACKER_PASSWORD_HASH, EXPENSE_TRACKER_TOKEN_SALT } from '$env/static/private';
import { createHash, randomBytes } from 'crypto';

/**
 * Verify a password against the stored bcrypt hash.
 */
export async function verifyPassword(password: string): Promise<boolean> {
	const bcrypt = await import('bcryptjs');
	return bcrypt.compare(password, EXPENSE_TRACKER_PASSWORD_HASH);
}

/**
 * Generate a token from password hash + salt.
 * Token = SHA256(password_hash + salt)
 */
export function generateToken(): string {
	return createHash('sha256')
		.update(EXPENSE_TRACKER_PASSWORD_HASH + EXPENSE_TRACKER_TOKEN_SALT)
		.digest('hex');
}

/**
 * Verify a Bearer token from Authorization header.
 */
export function verifyAuth(request: Request): boolean {
	const auth = request.headers.get('authorization');
	if (!auth || !auth.startsWith('Bearer ')) return false;
	const token = auth.slice(7);
	const expected = generateToken();
	return token === expected;
}

/**
 * Generate a random salt (32 chars).
 */
export function generateSalt(): string {
	return randomBytes(16).toString('hex').slice(0, 32);
}

/**
 * Hash a password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
	const bcrypt = await import('bcryptjs');
	return bcrypt.hash(password, 10);
}
