import users from '../../services/users';

jest.mock('../../data-access/users');
jest.mock('../../data-access/texts');
jest.mock('../../utils/sendmail');
jest.mock('bcrypt');
jest.mock('uuid');
jest.mock('jsonwebtoken');
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({})),
}));

import userData from '../../data-access/users';
import textData from '../../data-access/texts';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const mockedUserData = jest.mocked(userData);
const mockedTextData = jest.mocked(textData);
const mockedBcrypt = jest.mocked(bcrypt);
const mockedUuid = jest.mocked(uuidv4);
const mockedJwt = jest.mocked(jwt);

const fakeUserDB = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  password_hash: 'hashed_password',
  known_language_id: '1',
  learn_language_id: '2',
  verified: false,
  verification_code: 'abc-123',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('sanitizeUser', () => {
  it('strips passwordHash and verificationCode from user object', () => {
    const user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'secret_hash',
      verificationCode: 'secret_code',
      knownLanguageId: '1',
      learnLanguageId: '2',
      verified: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    const result = users.sanitizeUser(user);
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('verificationCode');
    expect(result).toHaveProperty('username', 'testuser');
    expect(result).toHaveProperty('email', 'test@example.com');
  });
});

describe('addNew', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects duplicate email', async () => {
    mockedUserData.getByEmail.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    await expect(
      users.addNew('user', 'pw', 'taken@example.com', '1', '2')
    ).rejects.toThrow('Email already in use.');
  });

  it('creates user and returns sanitized result (no passwordHash leaked)', async () => {
    mockedUserData.getByEmail.mockResolvedValue({
      rows: [],
      rowCount: 0,
    } as never);
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
    (mockedUuid as unknown as jest.Mock).mockReturnValue('generated-uuid');
    mockedUserData.addNew.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    mockedTextData.addMatchGirlToUser.mockResolvedValue(undefined as never);

    const result = await users.addNew(
      'testuser',
      'password123',
      'test@example.com',
      '1',
      '2'
    );
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('verificationCode');
    expect(result).toHaveProperty('username', 'testuser');
  });

  it('adds sample text for new user', async () => {
    mockedUserData.getByEmail.mockResolvedValue({
      rows: [],
      rowCount: 0,
    } as never);
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
    (mockedUuid as unknown as jest.Mock).mockReturnValue('generated-uuid');
    mockedUserData.addNew.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    mockedTextData.addMatchGirlToUser.mockResolvedValue(undefined as never);

    await users.addNew('testuser', 'password123', 'test@example.com', '1', '2');
    expect(mockedTextData.addMatchGirlToUser).toHaveBeenCalledWith(1, '2');
  });
});

describe('updatePassword', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws when currentPassword is empty', async () => {
    await expect(users.updatePassword('1', '', 'newpw')).rejects.toThrow(
      'You must submit your current password.'
    );
  });

  it('throws when newPassword is empty', async () => {
    await expect(users.updatePassword('1', 'current', '')).rejects.toThrow(
      'You must submit a new password.'
    );
  });

  it('rejects when current password does not match', async () => {
    mockedUserData.getById.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(users.updatePassword('1', 'wrong', 'newpw')).rejects.toThrow(
      'Incorrect password.'
    );
  });

  it('succeeds when current password matches', async () => {
    mockedUserData.getById.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('new_hash');
    mockedUserData.updatePassword.mockResolvedValue({ rowCount: 1 } as never);
    const result = await users.updatePassword('1', 'correct', 'newpw');
    expect(result).toEqual({ message: 'Your password has been updated' });
  });
});

describe('verify', () => {
  beforeEach(() => jest.clearAllMocks());

  it('succeeds when code matches and token decodes to email', async () => {
    (mockedJwt.verify as jest.Mock).mockReturnValue('test@example.com');
    mockedUserData.getByEmail.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    mockedUserData.verify.mockResolvedValue({
      rows: [{ ...fakeUserDB, verified: true }],
      rowCount: 1,
    } as never);
    const result = await users.verify('abc-123', 'valid-token');
    expect(result).toHaveProperty('verified', true);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('throws when verification code does not match', async () => {
    (mockedJwt.verify as jest.Mock).mockReturnValue('test@example.com');
    mockedUserData.getByEmail.mockResolvedValue({
      rows: [fakeUserDB],
      rowCount: 1,
    } as never);
    await expect(users.verify('wrong-code', 'valid-token')).rejects.toThrow(
      'invalid verification code'
    );
  });

  it('throws when token decodes to non-string (object payload)', async () => {
    (mockedJwt.verify as jest.Mock).mockReturnValue({
      email: 'test@example.com',
      id: 1,
    });
    await expect(users.verify('abc-123', 'object-token')).rejects.toThrow(
      'invalid token'
    );
  });
});
