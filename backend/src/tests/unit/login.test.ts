import login from '../../services/login';

jest.mock('../../data-access/users');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({})),
}));

import userData from '../../data-access/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const mockedUserData = jest.mocked(userData);
const mockedBcrypt = jest.mocked(bcrypt);
const mockedJwt = jest.mocked(jwt);

const fakeUserDB = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  password_hash: 'hashed_password',
  known_language_id: '1',
  learn_language_id: '2',
  verified: true,
  verification_code: 'abc-123',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns sanitized user with JWT token on valid credentials', async () => {
    mockedUserData.getByEmail.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockedJwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

    const result = await login.login('test@example.com', 'password');
    expect(result.token).toBe('fake-jwt-token');
    expect(result).toHaveProperty('email', 'test@example.com');
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('password_hash');
  });

  it('throws same error for non-existent email and wrong password', async () => {
    mockedUserData.getByEmail.mockResolvedValue({
      rows: [],
      rowCount: 0,
    } as never);
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);
    const noEmailError = login
      .login('nobody@example.com', 'password')
      .catch((e: Error) => e.message);

    jest.clearAllMocks();
    mockedUserData.getByEmail.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);
    const wrongPwError = login
      .login('test@example.com', 'wrongpassword')
      .catch((e: Error) => e.message);

    expect(await noEmailError).toBe(await wrongPwError);
  });

  it('signs token with 7-day expiration', async () => {
    mockedUserData.getByEmail.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockedJwt.sign as jest.Mock).mockReturnValue('token');

    await login.login('test@example.com', 'password');
    expect(mockedJwt.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      { expiresIn: 60 * 60 * 24 * 7 }
    );
  });
});
