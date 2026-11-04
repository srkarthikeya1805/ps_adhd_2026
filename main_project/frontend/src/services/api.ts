import {
  BackendRootInfo,
  BatchPredictionResponse,
  HealthResponse,
  ModelInfoResponse,
  ValidationReport,
} from '../types';

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';

export function getApiBaseUrl(): string {
  // Allow user override from localStorage if set in Settings
  const localOverride = localStorage.getItem('neuroscan_api_base_url');
  if (localOverride && localOverride.trim()) {
    return localOverride.trim().replace(/\/+$/, '');
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_BASE_URL;
}

export function setApiBaseUrl(url: string): void {
  if (!url || !url.trim()) {
    localStorage.removeItem('neuroscan_api_base_url');
  } else {
    localStorage.setItem('neuroscan_api_base_url', url.trim().replace(/\/+$/, ''));
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let message = `Server returned HTTP ${response.status} ${response.statusText}`;
    if (data) {
      if (typeof data === 'string') {
        message = data;
      } else if (typeof data === 'object') {
        if (data.detail) {
          message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        } else if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        }
      }
    }
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      signal,
    });
    return await handleResponse<HealthResponse>(res);
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Cannot connect to backend at ${baseUrl}. Ensure backend is running. (${err.message || err})`,
      0
    );
  }
}

export async function getRootInfo(signal?: AbortSignal): Promise<BackendRootInfo> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/`, {
    method: 'GET',
    signal,
  });
  return await handleResponse<BackendRootInfo>(res);
}

export async function getModelInfo(signal?: AbortSignal): Promise<ModelInfoResponse> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/model/info`, {
    method: 'GET',
    signal,
  });
  return await handleResponse<ModelInfoResponse>(res);
}

export async function validateEEG(
  files: File[],
  samplingRate?: number,
  signal?: AbortSignal
): Promise<ValidationReport[]> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  if (samplingRate !== undefined && samplingRate > 0) {
    formData.append('sampling_rate', samplingRate.toString());
  }

  // Do NOT manually set Content-Type header with FormData! Let browser set boundary.
  const res = await fetch(`${baseUrl}/api/validate`, {
    method: 'POST',
    body: formData,
    signal,
  });

  return await handleResponse<ValidationReport[]>(res);
}

export async function predictEEG(
  files: File[],
  samplingRate?: number,
  signal?: AbortSignal
): Promise<BatchPredictionResponse> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  if (samplingRate !== undefined && samplingRate > 0) {
    formData.append('sampling_rate', samplingRate.toString());
  }

  // Large EEG recordings can take a moment for deep inference; let browser manage boundary
  const res = await fetch(`${baseUrl}/api/predict`, {
    method: 'POST',
    body: formData,
    signal,
  });

  return await handleResponse<BatchPredictionResponse>(res);
}
