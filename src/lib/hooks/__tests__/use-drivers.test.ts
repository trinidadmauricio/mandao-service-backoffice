import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useDrivers,
  useDriver,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
} from "../use-drivers";
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

describe("useDrivers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch drivers", async () => {
    const mockDrivers = [
      {
        id: "1",
        user_id: "user-1",
        logistics_provider_id: "provider-1",
        availability_status: "AVAILABLE",
        work_type: "FULL_TIME",
        total_deliveries: 10,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockDrivers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useDrivers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockDrivers);
    expect(result.current.data?.total).toBe(1);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/drivers"),
      { params: undefined }
    );
  });

  it("should fetch drivers with search filter", async () => {
    const mockDrivers = [
      {
        id: "1",
        user_id: "user-1",
        logistics_provider_id: "provider-1",
        availability_status: "AVAILABLE",
        work_type: "FULL_TIME",
        total_deliveries: 10,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockDrivers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const filters = { search: "John" };
    const { result } = renderHook(() => useDrivers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockDrivers);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/drivers"),
      { params: { search: "John" } }
    );
  });

  it("should fetch drivers with availability_status filter", async () => {
    const mockDrivers = [
      {
        id: "1",
        user_id: "user-1",
        logistics_provider_id: "provider-1",
        availability_status: "AVAILABLE",
        work_type: "FULL_TIME",
        total_deliveries: 10,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockDrivers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const filters = { availability_status: "AVAILABLE" as const };
    const { result } = renderHook(() => useDrivers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockDrivers);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/drivers"),
      { params: { availability_status: "AVAILABLE" } }
    );
  });

  it("should fetch drivers with work_type filter", async () => {
    const mockDrivers = [
      {
        id: "1",
        user_id: "user-1",
        logistics_provider_id: "provider-1",
        availability_status: "AVAILABLE",
        work_type: "FULL_TIME",
        total_deliveries: 10,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockDrivers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const filters = { work_type: "FULL_TIME" as const };
    const { result } = renderHook(() => useDrivers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockDrivers);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/drivers"),
      { params: { work_type: "FULL_TIME" } }
    );
  });

  it("should fetch drivers with multiple filters", async () => {
    const mockDrivers = [
      {
        id: "1",
        user_id: "user-1",
        logistics_provider_id: "provider-1",
        availability_status: "AVAILABLE",
        work_type: "FULL_TIME",
        total_deliveries: 10,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockDrivers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const filters = {
      search: "John",
      availability_status: "AVAILABLE" as const,
      work_type: "FULL_TIME" as const,
    };
    const { result } = renderHook(() => useDrivers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockDrivers);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/drivers"),
      {
        params: {
          search: "John",
          availability_status: "AVAILABLE",
          work_type: "FULL_TIME",
        },
      }
    );
  });

  it("should fetch drivers with pagination", async () => {
    const mockDrivers = [
      {
        id: "1",
        user_id: "user-1",
        logistics_provider_id: "provider-1",
        availability_status: "AVAILABLE",
        work_type: "FULL_TIME",
        total_deliveries: 10,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockDrivers,
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      },
    });

    const filters = { page: 2, limit: 10 };
    const { result } = renderHook(() => useDrivers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockDrivers);
    expect(result.current.data?.total).toBe(25);
    expect(result.current.data?.page).toBe(2);
    expect(result.current.data?.limit).toBe(10);
    expect(result.current.data?.totalPages).toBe(3);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/drivers"),
      { params: { page: 2, limit: 10 } }
    );
  });

  it("should handle response without pagination data (backward compatibility)", async () => {
    const mockDrivers = [
      {
        id: "1",
        user_id: "user-1",
        logistics_provider_id: "provider-1",
        availability_status: "AVAILABLE",
        work_type: "FULL_TIME",
        total_deliveries: 10,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
        data: mockDrivers,
      },
    });

    const { result } = renderHook(() => useDrivers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockDrivers);
    expect(result.current.data?.total).toBe(mockDrivers.length);
    expect(result.current.data?.page).toBe(1);
    expect(result.current.data?.limit).toBe(mockDrivers.length || 10);
  });
});

describe("useDriver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch a single driver", async () => {
    const mockDriver = {
      id: "1",
      user_id: "user-1",
      logistics_provider_id: "provider-1",
      availability_status: "AVAILABLE",
      work_type: "FULL_TIME",
      total_deliveries: 10,
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockDriver },
    });

    const { result } = renderHook(() => useDriver("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDriver);
  });
});

describe("useCreateDriver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a driver", async () => {
    const mockDriver = {
      id: "1",
      user_id: "user-1",
      logistics_provider_id: "provider-1",
      availability_status: "AVAILABLE",
      work_type: "FULL_TIME",
      total_deliveries: 0,
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { data: mockDriver },
    });

    const { result } = renderHook(() => useCreateDriver(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync(mockDriver);

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining("/drivers"),
      mockDriver
    );
  });
});

describe("useUpdateDriver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a driver", async () => {
    const mockDriver = {
      id: "1",
      user_id: "user-1",
      logistics_provider_id: "provider-1",
      availability_status: "BUSY",
      work_type: "FULL_TIME",
      total_deliveries: 10,
    };

    (apiClient.patch as jest.Mock).mockResolvedValue({
      data: { data: mockDriver },
    });

    const { result } = renderHook(() => useUpdateDriver(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: "1",
      data: { availability_status: "BUSY" },
    });

    expect(apiClient.patch).toHaveBeenCalledWith(
      expect.stringContaining("/drivers/1"),
      { availability_status: "BUSY" }
    );
  });
});

describe("useDeleteDriver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a driver", async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useDeleteDriver(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("1");

    expect(apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining("/drivers/1")
    );
  });
});

