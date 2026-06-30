import { settingsStore } from '../../state/store.js';

const CREDENTIAL_KEY = 'finplanner.webauthn.credentialId';

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBuffer(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(value.length + (4 - (value.length % 4)) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function isAvailable() {
  return typeof window !== 'undefined'
    && typeof window.PublicKeyCredential !== 'undefined'
    && typeof navigator?.credentials?.create === 'function';
}

export async function isPlatformAuthenticatorAvailable() {
  if (!isAvailable()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function hasRegisteredCredential() {
  return Boolean(localStorage.getItem(CREDENTIAL_KEY));
}

export async function registerCredential() {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Финансовый планировщик' },
      user: { id: userId, name: 'finplanner', displayName: 'FinPlanner' },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
      timeout: 60000,
    },
  });
  localStorage.setItem(CREDENTIAL_KEY, bufferToBase64url(credential.rawId));
  return true;
}

export async function verify() {
  const storedId = localStorage.getItem(CREDENTIAL_KEY);
  if (!storedId) return false;
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  try {
    await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: base64urlToBuffer(storedId), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export function disable() {
  localStorage.removeItem(CREDENTIAL_KEY);
  settingsStore.set({ appLockEnabled: false });
}
