/**
 * VPHS Services Pvt. Ltd. - Secure Storage Service
 *
 * Provides cross-platform secure storage for sensitive authentication tokens
 * and user session data. Uses Expo SecureStore on native iOS/Android (hardware-backed
 * Keychain/Keystore) and safe web storage fallback when running in a browser.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AppConfig } from '@/constants/config';

// In-memory fallback if storage is completely unavailable
const memoryFallback = new Map<string, string>();

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export const storageService = {
  /**
   * Save a key-value pair securely
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const isAvailable = await isSecureStoreAvailable();
      if (isAvailable) {
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
        return;
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }

      memoryFallback.set(key, value);
    } catch (err) {
      console.warn(`[StorageService] Failed to set item "${key}":`, err);
      memoryFallback.set(key, value);
    }
  },

  /**
   * Retrieve a key-value pair securely
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const isAvailable = await isSecureStoreAvailable();
      if (isAvailable) {
        return await SecureStore.getItemAsync(key);
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }

      return memoryFallback.get(key) || null;
    } catch (err) {
      console.warn(`[StorageService] Failed to get item "${key}":`, err);
      return memoryFallback.get(key) || null;
    }
  },

  /**
   * Delete a key-value pair securely
   */
  async removeItem(key: string): Promise<void> {
    try {
      const isAvailable = await isSecureStoreAvailable();
      if (isAvailable) {
        await SecureStore.deleteItemAsync(key);
        return;
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }

      memoryFallback.delete(key);
    } catch (err) {
      console.warn(`[StorageService] Failed to remove item "${key}":`, err);
      memoryFallback.delete(key);
    }
  },

  /**
   * Save authentication token
   */
  async saveAuthToken(token: string): Promise<void> {
    await this.setItem(AppConfig.storageKeys.authToken, token);
  },

  /**
   * Retrieve authentication token
   */
  async getAuthToken(): Promise<string | null> {
    return await this.getItem(AppConfig.storageKeys.authToken);
  },

  /**
   * Remove authentication token
   */
  async removeAuthToken(): Promise<void> {
    await this.removeItem(AppConfig.storageKeys.authToken);
  },

  /**
   * Save authenticated user profile
   */
  async saveUserProfile(user: unknown): Promise<void> {
    try {
      const json = JSON.stringify(user);
      await this.setItem(AppConfig.storageKeys.authUser, json);
    } catch (err) {
      console.warn('[StorageService] Failed to serialize user profile:', err);
    }
  },

  /**
   * Retrieve authenticated user profile
   */
  async getUserProfile<T>(): Promise<T | null> {
    try {
      const json = await this.getItem(AppConfig.storageKeys.authUser);
      if (!json) return null;
      return JSON.parse(json) as T;
    } catch (err) {
      console.warn('[StorageService] Failed to deserialize user profile:', err);
      return null;
    }
  },

  /**
   * Clear all auth session data
   */
  async clearSession(): Promise<void> {
    await Promise.all([
      this.removeAuthToken(),
      this.removeItem(AppConfig.storageKeys.authUser),
    ]);
  },
};
