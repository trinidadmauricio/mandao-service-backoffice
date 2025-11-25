import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../use-users";
import { apiClient } from "@/lib/api/client";

// Mock dependencies
jest.mock("@/lib/api/client");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
};

describe("useUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch users", async () => {
    const mockUsers = [
      {
        id: "1",
        email: "user1@example.com",
        first_name: "John",
        last_name: "Doe",
        role: "MERCHANT_USER" as const,
        status: "ACTIVE" as const,
        email_verified: true,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockUsers);
    expect(result.current.data?.total).toBe(1);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      { params: undefined }
    );
  });

  it("should fetch users with search filter", async () => {
    const mockUsers = [
      {
        id: "1",
        email: "john@example.com",
        first_name: "John",
        last_name: "Doe",
        role: "MERCHANT_USER" as const,
        status: "ACTIVE" as const,
        email_verified: true,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const filters = { search: "john" };
    const { result } = renderHook(() => useUsers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockUsers);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      { params: { search: "john" } }
    );
  });

  it("should fetch users with role filter", async () => {
    const mockUsers = [
      {
        id: "1",
        email: "supervisor@example.com",
        first_name: "Jane",
        last_name: "Smith",
        role: "SUPERVISOR" as const,
        status: "ACTIVE" as const,
        email_verified: true,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const filters = { role: "SUPERVISOR" as const };
    const { result } = renderHook(() => useUsers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockUsers);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      { params: { role: "SUPERVISOR" } }
    );
  });

  it("should fetch users with status filter", async () => {
    const mockUsers = [
      {
        id: "1",
        email: "user1@example.com",
        first_name: "John",
        last_name: "Doe",
        role: "MERCHANT_USER" as const,
        status: "ACTIVE" as const,
        email_verified: true,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const filters = { status: "ACTIVE" as const };
    const { result } = renderHook(() => useUsers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockUsers);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      { params: { status: "ACTIVE" } }
    );
  });

  it("should fetch users with pagination", async () => {
    const mockUsers = [
      {
        id: "1",
        email: "user1@example.com",
        first_name: "John",
        last_name: "Doe",
        role: "MERCHANT_USER" as const,
        status: "ACTIVE" as const,
        email_verified: true,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockUsers,
        total: 10,
        page: 2,
        limit: 5,
        totalPages: 2,
      },
    });

    const filters = { page: 2, limit: 5 };
    const { result } = renderHook(() => useUsers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockUsers);
    expect(result.current.data?.total).toBe(10);
    expect(result.current.data?.page).toBe(2);
    expect(result.current.data?.limit).toBe(5);
    expect(result.current.data?.totalPages).toBe(2);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      { params: { page: 2, limit: 5 } }
    );
  });

  it("should combine multiple filters", async () => {
    const mockUsers = [
      {
        id: "1",
        email: "john@example.com",
        first_name: "John",
        last_name: "Doe",
        role: "MERCHANT_USER" as const,
        status: "ACTIVE" as const,
        email_verified: true,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const filters = {
      search: "john",
      role: "MERCHANT_USER" as const,
      status: "ACTIVE" as const,
      page: 1,
      limit: 10,
    };
    const { result } = renderHook(() => useUsers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockUsers);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      { params: filters }
    );
  });

  it("should handle response without pagination metadata", async () => {
    const mockUsers = [
      {
        id: "1",
        email: "user1@example.com",
        first_name: "John",
        last_name: "Doe",
        role: "MERCHANT_USER" as const,
        status: "ACTIVE" as const,
        email_verified: true,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockUsers,
      },
    });

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockUsers);
    expect(result.current.data?.total).toBe(mockUsers.length);
  });
});

describe("useUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch a single user", async () => {
    const mockUser = {
      id: "1",
      email: "user1@example.com",
      first_name: "John",
      last_name: "Doe",
      role: "MERCHANT_USER" as const,
      status: "ACTIVE" as const,
      email_verified: true,
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        data: mockUser,
      },
    });

    const { result } = renderHook(() => useUser("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/users/1")
    );
  });

  it("should not fetch when userId is empty", () => {
    const { result } = renderHook(() => useUser(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});

describe("useCreateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a user", async () => {
    const newUser = {
      email: "newuser@example.com",
      first_name: "New",
      last_name: "User",
      role: "MERCHANT_USER" as const,
    };

    const mockCreatedUser = {
      id: "1",
      ...newUser,
      status: "ACTIVE" as const,
      email_verified: false,
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: {
        data: mockCreatedUser,
      },
    });

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newUser);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCreatedUser);
    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      newUser
    );
  });
});

describe("useUpdateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a user", async () => {
    const userId = "1";
    const updateData = {
      first_name: "Updated",
      last_name: "Name",
    };

    const mockUpdatedUser = {
      id: userId,
      email: "user1@example.com",
      ...updateData,
      role: "MERCHANT_USER" as const,
      status: "ACTIVE" as const,
      email_verified: true,
    };

    (apiClient.patch as jest.Mock).mockResolvedValue({
      data: {
        data: mockUpdatedUser,
      },
    });

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: userId, data: updateData });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUpdatedUser);
    expect(apiClient.patch).toHaveBeenCalledWith(
      expect.stringContaining(`/users/${userId}`),
      updateData
    );
  });
});

describe("useDeleteUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a user", async () => {
    const userId = "1";

    (apiClient.delete as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(userId);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining(`/users/${userId}`)
    );
  });
});

