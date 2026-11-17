import { describe, expect, it } from 'vitest';
import { generateSalt, generateToken, hashPassword, verifyAuth, verifyPassword } from '../../src/lib/server/expense-tracker/auth';

describe('generateToken', () => {
	it('returns the same fixed-length SHA-256 token for the configured secret', () => {
		const first = generateToken();
		expect(first).toMatch(/^[a-f0-9]{64}$/);
		expect(generateToken()).toBe(first);
	});
});

describe('verifyAuth', () => {
	it('accepts a valid Bearer token', () => {
		const request = new Request('https://example.test/api', {
			headers: { Authorization: `Bearer ${generateToken()}` }
		});
		expect(verifyAuth(request)).toBe(true);
	});

	it.each([
		['missing authorization', undefined],
		['basic scheme', 'Basic abc'],
		['wrong bearer token', 'Bearer not-the-token'],
		['missing bearer value', 'Bearer '],
		['wrong scheme casing', 'bearer token']
	])('rejects %s', (_case, authorization) => {
		const headers = authorization ? { Authorization: authorization } : undefined;
		const request = new Request('https://example.test/api', { headers });
		expect(verifyAuth(request)).toBe(false);
	});
});

describe('password helpers', () => {
	it('hashes passwords with bcrypt and verifies the resulting hash', async () => {
		const password = 'a secure test password';
		const hash = await hashPassword(password);
		const bcrypt = await import('bcryptjs');

		expect(hash).toMatch(/^\$2[aby]\$10\$/);
		expect(await bcrypt.compare(password, hash)).toBe(true);
		expect(await bcrypt.compare('a different password', hash)).toBe(false);
	});

	it('rejects a password that does not match the configured admin hash', async () => {
		expect(await verifyPassword('definitely-not-the-admin-password')).toBe(false);
	});
});

describe('generateSalt', () => {
	it('returns a 32-character lowercase hexadecimal value', () => {
		expect(generateSalt()).toMatch(/^[a-f0-9]{32}$/);
	});

	it('generates a fresh salt for each call', () => {
		expect(generateSalt()).not.toBe(generateSalt());
	});
});
