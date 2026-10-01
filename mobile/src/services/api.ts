/**
 * VPHS Services Pvt. Ltd. - Authentication & API Service
 *
 * Handles HTTP communication with the VPHS HRMS production API,
 * credentials validation, token persistence, and session management.
 */

import { AppConfig } from '@/constants/config';
import { storageService } from './storage';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  userId?: string;
  username: string;
  email?: string;
  role: string;
  employeeId?: string;
  department?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface LoginSuccessData {
  token: string;
  user: AuthenticatedUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Perform login against the VPHS HRMS API
 */
export async function loginToHrms(credentials: LoginCredentials): Promise<LoginResult> {
  const cleanUsername = credentials.username.trim();
  const cleanPassword = credentials.password;

  if (!cleanUsername) {
    return { success: false, error: 'Please enter your Employee ID or Username.' };
  }

  if (!cleanPassword) {
    return { success: false, error: 'Please enter your password.' };
  }

  const endpoint = `${AppConfig.api.baseUrl}${AppConfig.api.auth.login}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AppConfig.api.timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username: cleanUsername,
        password: cleanPassword,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let json: ApiResponse<LoginSuccessData>;
    try {
      json = await response.json();
    } catch {
      return {
        success: false,
        error: `Server returned invalid response (Status ${response.status}). Please try again.`,
      };
    }

    if (!response.ok || !json.success) {
      const errorMessage =
        json.error ||
        json.message ||
        (response.status === 401
          ? 'Invalid Employee ID or password. Please verify your credentials.'
          : `Login failed (Status: ${response.status}).`);

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Success: Extract token and user
    const token = json.data?.token;
    const user = json.data?.user;

    if (!token) {
      return {
        success: false,
        error: 'Authentication failed: No access token received from server.',
      };
    }

    // Store token and profile securely
    await storageService.saveAuthToken(token);
    if (user) {
      await storageService.saveUserProfile(user);
    }

    return {
      success: true,
      token,
      user,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        error: 'Connection timed out. The HRMS server took too long to respond. Please check your internet connection.',
      };
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error('[ApiService] Login network error:', message);

    return {
      success: false,
      error: 'Unable to connect to VPHS HRMS server. Please verify your network connection and try again.',
    };
  }
}

/**
 * Check if the user is currently authenticated with a valid token
 */
export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  token: string | null;
  user: AuthenticatedUser | null;
}> {
  const token = await storageService.getAuthToken();
  const user = await storageService.getUserProfile<AuthenticatedUser>();

  return {
    isAuthenticated: !!token,
    token,
    user,
  };
}

/**
 * Logout and clear session
 */
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  status?: string;
  photoUrl?: string;
  salaryCtc?: number;

  department?: {
    id: string;
    name: string;
  } | null;

  designation?: {
    id: string;
    name: string;
  } | null;

  site?: {
    id: string;
    name: string;
  } | null;

  shift?: {
    id: string;
    name: string;
  } | null;

  user?: {
    id: string;
    username: string;
    role: string;
    isActive: boolean;
  } | null;
}

export interface EmployeeListMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface EmployeeListResult {
  success: boolean;
  employees: Employee[];
  meta?: EmployeeListMeta;
  error?: string;
}

export async function getEmployees(
  search = '',
  page = 1,
  limit = 50,
): Promise<EmployeeListResult> {
  try {
    const token = await storageService.getAuthToken();

    if (!token) {
      return {
        success: false,
        employees: [],
        error: 'Your session has expired. Please sign in again.',
      };
    }

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search.trim()) {
      params.append('search', search.trim());
    }

    const endpoint =
      `${AppConfig.api.baseUrl}/employees?${params.toString()}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    let json: ApiResponse<Employee[]>;

    try {
      json = await response.json();
    } catch {
      return {
        success: false,
        employees: [],
        error: `Server returned an invalid response (Status ${response.status}).`,
      };
    }

    if (!response.ok || !json.success) {
      return {
        success: false,
        employees: [],
        error:
          json.error ||
          json.message ||
          `Unable to fetch employees (Status ${response.status}).`,
      };
    }

    return {
      success: true,
      employees: json.data || [],
      meta: json.meta as EmployeeListMeta | undefined,
    };
  } catch (error) {
    console.error('[ApiService] Employee list error:', error);

    return {
      success: false,
      employees: [],
      error: 'Unable to connect to the VPHS HRMS server.',
    };
  }
}