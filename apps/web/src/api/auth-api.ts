import type { AuthTokens, LoginInput, RegisterInput, User } from '@vamsha/shared-types';

interface AuthPayload extends AuthTokens {
  user: User;
}

const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'demo@vamsha.local',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
};

const MOCK_SESSION: AuthPayload = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: MOCK_USER,
};

export async function registerUser(input: RegisterInput): Promise<AuthPayload> {
  // Mocked registration response for UI review. The real GraphQL auth call is
  // intentionally bypassed so screens can be explored without backend services.
  await new Promise((resolve) => setTimeout(resolve, 250));
  return {
    ...MOCK_SESSION,
    user: {
      ...MOCK_USER,
      email: input.email || MOCK_USER.email,
      name: input.name || MOCK_USER.name,
    },
  };
}

export async function loginUser(input: LoginInput): Promise<AuthPayload> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return {
    ...MOCK_SESSION,
    user: {
      ...MOCK_USER,
      email: input.email || MOCK_USER.email,
    },
  };
}
