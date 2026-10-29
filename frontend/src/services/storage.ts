import { AnalysisHistoryItem, BatchPredictionResponse, FilePredictionResult } from '../types';

const STORAGE_KEYS = {
  CURRENT_PREDICTION: 'neuroscan_current_prediction',
  CURRENT_FILE_RESULT: 'neuroscan_current_file_result',
  ANALYSIS_HISTORY: 'neuroscan_analysis_history',
  USER_SESSION: 'neuroscan_user_session',
  REDUCED_MOTION: 'neuroscan_reduced_motion',
};

export function saveLatestBatch(batch: BatchPredictionResponse): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_PREDICTION, JSON.stringify(batch));
    // If single file, also save as current file
    if (batch.results && batch.results.length > 0) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_FILE_RESULT, JSON.stringify(batch.results[0]));
    }
  } catch (e) {
    console.warn('Could not save latest batch to sessionStorage', e);
  }
}

export function getLatestBatch(): BatchPredictionResponse | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_PREDICTION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSelectedFileResult(result: FilePredictionResult): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_FILE_RESULT, JSON.stringify(result));
  } catch (e) {
    console.warn('Could not save file result to sessionStorage', e);
  }
}

export function getSelectedFileResult(): FilePredictionResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_FILE_RESULT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function addToHistory(result: FilePredictionResult, batchType: string = 'single_file'): void {
  try {
    const existing = getHistory();
    const newItem: AnalysisHistoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      filename: result.filename,
      prediction: result.prediction || 'Unknown',
      adhd_probability: result.adhd_probability ?? 0,
      confidence: result.confidence ?? 0,
      windows: result.total_windows ?? (result.details?.windows || 0),
      duration_seconds: result.details?.duration_seconds ?? 0,
      batch_type: batchType,
      raw_result: result,
    };
    // Keep last 50 items
    const updated = [newItem, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not add to history', e);
  }
}

export function getHistory(): AnalysisHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
}

export interface UserSession {
  email: string;
  name: string;
  isGuest: boolean;
  role: string;
  loginTime: string;
}

export function saveSession(session: UserSession): void {
  localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
}

export function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
}
