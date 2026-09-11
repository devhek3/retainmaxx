import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

let client;
let appStateSubscription;

function requireClientConfig() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error('Supabase is not configured. Set the two EXPO_PUBLIC_SUPABASE_* variables.');
  }

  return { publishableKey, url };
}

export function getSupabaseClient() {
  if (!client) {
    const { publishableKey, url } = requireClientConfig();
    client = createClient(url, publishableKey, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
      },
    });
  }

  return client;
}

export async function getCurrentSession() {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

export function startSessionRefresh() {
  if (Platform.OS === 'web' || appStateSubscription) {
    return () => {};
  }

  const supabase = getSupabaseClient();
  if (AppState.currentState === 'active') {
    supabase.auth.startAutoRefresh();
  }
  appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });

  return () => {
    appStateSubscription?.remove();
    appStateSubscription = undefined;
    supabase.auth.stopAutoRefresh();
  };
}
