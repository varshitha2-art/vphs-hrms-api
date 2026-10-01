/**
 * VPHS Services Pvt. Ltd. - Authentication & API Service
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

export interface EmployeeListMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  meta?: EmployeeListMeta;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: AuthenticatedUser;
  error?: string;
}

export async function loginToHrms(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const cleanUsername = credentials.username.trim();
  const cleanPassword = credentials.password;

  if (!cleanUsername) {
    return {
      success: false,
      error: 'Please enter your Employee ID or Username.',
    };
  }

  if (!cleanPassword) {
    return {
      success: false,
      error: 'Please enter your password.',
    };
  }

  const endpoint =
    AppConfig.api.baseUrl + AppConfig.api.auth.login;

  console.log('[ApiService] Login endpoint:', endpoint);

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
    });

    console.log(
      '[ApiService] Login HTTP status:',
      response.status,
    );

    const responseText = await response.text();

    console.log(
      '[ApiService] Login response:',
      responseText,
    );

    let json: ApiResponse<LoginSuccessData>;

    try {
      json = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        error:
          'Server returned an invalid response. Status: ' +
          response.status,
      };
    }

    if (!response.ok || !json.success) {
      return {
        success: false,
        error:
          json.error ||
          json.message ||
          'Login failed. Status: ' +
          response.status,
      };
    }

    const token = json.data?.token;
    const user = json.data?.user;

    if (!token) {
      return {
        success: false,
        error:
          'Authentication failed: No access token received from server.',
      };
    }

    await storageService.saveAuthToken(token);

    if (user) {
      await storageService.saveUserProfile(user);
    }

    console.log('[ApiService] Login successful');

    return {
      success: true,
      token,
      user,
    };
  } catch (error: unknown) {
    console.error(
      '[ApiService] Login network error:',
      error,
    );

    return {
      success: false,
      error:
        'Unable to connect to VPHS HRMS server. Please verify your network connection and try again.',
    };
  }
}

export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  token: string | null;
  user: AuthenticatedUser | null;
}> {
  const token = await storageService.getAuthToken();

  const user =
    await storageService.getUserProfile<AuthenticatedUser>();

  return {
    isAuthenticated: !!token,
    token: token,
    user: user,
  };
}

export async function logoutFromHrms(): Promise<void> {
  try {
    await storageService.clearSession();
  } catch (error) {
    console.error(
      '[ApiService] Logout error:',
      error,
    );
  }
}

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

    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));

    if (search.trim()) {
      params.append('search', search.trim());
    }

    const endpoint =
      AppConfig.api.baseUrl +
      '/api/employees?' +
      params.toString();

    console.log(
      '[ApiService] Employee endpoint:',
      endpoint,
    );

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });

    console.log(
      '[ApiService] Employee HTTP status:',
      response.status,
    );

    const responseText = await response.text();

    console.log(
      '[ApiService] Employee response:',
      responseText,
    );

    let json: any;

    try {
      json = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        employees: [],
        error:
          'Server returned an invalid employee response. Status: ' +
          response.status,
      };
    }

    if (!response.ok || !json.success) {
      return {
        success: false,
        employees: [],
        error:
          json.error ||
          json.message ||
          'Unable to fetch employees. Status: ' +
          response.status,
      };
    }

    const employees = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json.data?.employees)
        ? json.data.employees
        : [];

    const meta =
      json.meta ||
      json.data?.meta;

    return {
      success: true,
      employees,
      meta,
    };
  } catch (error: unknown) {
    console.error(
      '[ApiService] Employee list error:',
      error,
    );

    return {
      success: false,
      employees: [],
      error:
        'Unable to connect to the VPHS HRMS server.',
    };
  }
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  siteId?: string | null;
  shiftId?: string | null;
  date: string;
  status: string;
  inTime?: string | null;
  outTime?: string | null;
  workingHours?: number | null;
  overtimeHours?: number | null;
  remarks?: string | null;
}

export async function getTodayAttendance(): Promise<{
  success: boolean;
  attendance: AttendanceRecord | null;
  error?: string;
}> {
  try {
    const token = await storageService.getAuthToken();

    if (!token) {
      return {
        success: false,
        attendance: null,
        error: 'Your session has expired. Please sign in again.',
      };
    }

    const today = new Date().toISOString().split('T')[0];

    const endpoint =
      AppConfig.api.baseUrl +
      '/api/attendance?date=' +
      today;

    console.log(
      '[ApiService] Attendance endpoint:',
      endpoint,
    );

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });

    console.log(
      '[ApiService] Attendance HTTP status:',
      response.status,
    );

    const responseText = await response.text();

    console.log(
      '[ApiService] Attendance response:',
      responseText,
    );

    let json: any;

    try {
      json = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        attendance: null,
        error:
          'Server returned an invalid attendance response. Status: ' +
          response.status,
      };
    }

    if (!response.ok || !json.success) {
      return {
        success: false,
        attendance: null,
        error:
          json.error ||
          json.message ||
          'Unable to fetch attendance. Status: ' +
          response.status,
      };
    }

    const records = Array.isArray(json.data)
      ? json.data
      : [];

    return {
      success: true,
      attendance: records.length > 0 ? records[0] : null,
    };
  } catch (error) {
    console.error(
      '[ApiService] Attendance error:',
      error,
    );

    return {
      success: false,
      attendance: null,
      error:
        'Unable to connect to the VPHS HRMS server.',
    };
  }
}

export async function punchIn(
  latitude: number,
  longitude: number,
): Promise<{
  success: boolean;
  attendance: AttendanceRecord | null;
  error?: string;
}> {
  try {
    const token = await storageService.getAuthToken();

    if (!token) {
      return {
        success: false,
        attendance: null,
        error: 'Your session has expired. Please sign in again.',
      };
    }

    const endpoint =
      AppConfig.api.baseUrl +
      '/api/attendance/punch-in';

    console.log(
      '[ApiService] Punch In endpoint:',
      endpoint,
    );

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        latitude,
        longitude,
      }),
    });

    console.log(
      '[ApiService] Punch In HTTP status:',
      response.status,
    );

    const responseText = await response.text();

    console.log(
      '[ApiService] Punch In response:',
      responseText,
    );

    let json: any;

    try {
      json = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        attendance: null,
        error:
          'Server returned an invalid Punch In response. Status: ' +
          response.status,
      };
    }

    if (!response.ok || !json.success) {
      return {
        success: false,
        attendance: null,
        error:
          json.error ||
          json.message ||
          'Punch In was not accepted. Status: ' +
          response.status,
      };
    }

    return {
      success: true,
      attendance: json.data || null,
    };
  } catch (error) {
    console.error(
      '[ApiService] Punch In error:',
      error,
    );

    return {
      success: false,
      attendance: null,
      error:
        'Unable to connect to the VPHS HRMS server.',
    };
  }
}
export async function punchOut(
  latitude: number,
  longitude: number,
): Promise<{
  success: boolean;
  attendance: AttendanceRecord | null;
  error?: string;
}> {
  try {
    const token = await storageService.getAuthToken();

    if (!token) {
      return {
        success: false,
        attendance: null,
        error: 'Your session has expired. Please sign in again.',
      };
    }

    const endpoint =
      AppConfig.api.baseUrl +
      '/api/attendance/punch-out';

    console.log(
      '[ApiService] Punch Out endpoint:',
      endpoint,
    );

    const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token,
  },
  body: JSON.stringify({
    latitude,
    longitude,
  }),
});

    console.log(
      '[ApiService] Punch Out HTTP status:',
      response.status,
    );

    const responseText = await response.text();

    console.log(
      '[ApiService] Punch Out response:',
      responseText,
    );

    let json: any;

    try {
      json = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        attendance: null,
        error:
          'Server returned an invalid Punch Out response. Status: ' +
          response.status,
      };
    }

    if (!response.ok || !json.success) {
      return {
        success: false,
        attendance: null,
        error:
          json.error ||
          json.message ||
          'Punch Out was not accepted. Status: ' +
          response.status,
      };
    }

    return {
      success: true,
      attendance: json.data || null,
    };
  } catch (error) {
    console.error(
      '[ApiService] Punch Out error:',
      error,
    );

    return {
      success: false,
      attendance: null,
      error:
        'Unable to connect to the VPHS HRMS server.',
    };
  }
}

export interface Payslip {
  id: string;
  payrollId: string;
  employeeId: string;

  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  lopDays: number;

  basic: number;
  da: number;
  hra: number;
  conveyance: number;
  medicalAllowance: number;
  specialAllowance: number;
  lta: number;
  foodAllowance: number;
  communicationAllowance: number;
  uniformAllowance: number;
  leaveWages: number;
  variablePay: number;
  overtimePay: number;
  bonus: number;
  otherAllowance: number;

  grossSalary: number;

  employerPf: number;
  employerEsi: number;
  telanganaLwf: number;
  gratuity: number;
  insuranceBenefit: number;

  pfDeduction: number;
  esiDeduction: number;
  ptDeduction: number;
  tdsDeduction: number;
  lopDeduction: number;
  otherDeductions: number;

  totalDeductions: number;
  netSalary: number;

  status: string;
  payslipNumber: string;
  paymentDate?: string | null;
  paymentMode?: string | null;
  paymentRef?: string | null;
  isPaid: boolean;

  createdAt: string;
  updatedAt: string;

  payroll?: {
    id: string;
    payrollMonth: number;
    payrollYear: number;
    totalEmployees: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    status: string;
  };
}

export async function getMyPayslips(): Promise<{
  success: boolean;
  payslips: Payslip[];
  error?: string;
}> {
  try {
    const token = await storageService.getAuthToken();

    if (!token) {
      return {
        success: false,
        payslips: [],
        error: 'Your session has expired. Please sign in again.',
      };
    }

    const endpoint =
      AppConfig.api.baseUrl +
      '/api/payroll/my-payslips';

    console.log(
      '[ApiService] My Payslips endpoint:',
      endpoint,
    );

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });

    console.log(
      '[ApiService] My Payslips HTTP status:',
      response.status,
    );

    const responseText = await response.text();

    console.log(
      '[ApiService] My Payslips response:',
      responseText,
    );

    let json: any;

    try {
      json = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        payslips: [],
        error:
          'Server returned an invalid Payroll response. Status: ' +
          response.status,
      };
    }

    if (!response.ok || !json.success) {
      return {
        success: false,
        payslips: [],
        error:
          json.error ||
          json.message ||
          'Unable to load payslips. Status: ' +
          response.status,
      };
    }

    return {
      success: true,
      payslips: Array.isArray(json.data)
        ? json.data
        : [],
    };
  } catch (error) {
    console.error(
      '[ApiService] My Payslips error:',
      error,
    );

    return {
      success: false,
      payslips: [],
      error:
        'Unable to connect to the VPHS HRMS server.',
    };
  }
}
