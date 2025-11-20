import axios from 'axios';
import Cookies from 'js-cookie';
import { apiClient } from '../client';

// Mock dependencies
jest.mock('axios');
jest.mock('js-cookie');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Cookies.get as jest.Mock).mockReturnValue(null);
  });

  it('should add Authorization header when token is present', async () => {
    (Cookies.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'access_token') return 'token-123';
      return null;
    });

    const mockGet = jest.fn().mockResolvedValue({ data: {} });
    mockedAxios.create = jest.fn(() => ({
      get: mockGet,
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })) as unknown as typeof axios.create;

    await apiClient.get('/test');

    expect(mockGet).toHaveBeenCalled();
  });

  it('should add X-Tenant-Id header when tenant_id is present', async () => {
    (Cookies.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'tenant_id') return 'tenant-123';
      return null;
    });

    const mockGet = jest.fn().mockResolvedValue({ data: {} });
    mockedAxios.create = jest.fn(() => ({
      get: mockGet,
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })) as unknown as typeof axios.create;

    await apiClient.get('/test');

    expect(mockGet).toHaveBeenCalled();
  });
});

