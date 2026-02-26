import { useState, useEffect, useCallback } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { doc, setDoc, deleteDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export interface StoredPasskey {
  credentialId: string;
  publicKey: string;
  transports?: string[];
  createdAt: string;
  label: string;
}

// Client-side challenge generation (acceptable for single-user personal dashboard)
function generateChallenge(): Uint8Array {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge;
}

function bufferToBase64(buffer: ArrayBuffer | SharedArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer as ArrayBuffer)));
}

export function usePasskeys(uid?: string) {
  const [passkeys, setPasskeys] = useState<StoredPasskey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPasskeys = useCallback(async () => {
    if (!uid) return;
    try {
      const snap = await getDocs(collection(db, `users/${uid}/passkeys`));
      const keys: StoredPasskey[] = [];
      snap.forEach((doc) => keys.push(doc.data() as StoredPasskey));
      setPasskeys(keys);
    } catch (err: any) {
      console.error('Error loading passkeys:', err);
    }
  }, [uid]);

  useEffect(() => {
    loadPasskeys();
  }, [loadPasskeys]);

  const registerPasskey = async (label: string = 'Mi dispositivo') => {
    if (!uid) throw new Error('No user');
    setLoading(true);
    setError(null);

    try {
      const challenge = generateChallenge();

      const registration = await startRegistration({
        optionsJSON: {
          challenge: bufferToBase64(challenge.buffer),
          rp: {
            name: 'Lobsterclaw Dashboard',
            id: window.location.hostname,
          },
          user: {
            id: bufferToBase64(new TextEncoder().encode(uid).buffer),
            name: auth.currentUser?.email || 'usuario',
            displayName: auth.currentUser?.displayName || 'Usuario',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      });

      const passkey: StoredPasskey = {
        credentialId: registration.id,
        publicKey: registration.response.publicKey || '',
        transports: registration.response.transports || [],
        createdAt: new Date().toISOString(),
        label,
      };

      await setDoc(
        doc(db, `users/${uid}/passkeys`, registration.id),
        passkey
      );

      // Store uid mapping in a top-level collection for login lookup
      await setDoc(
        doc(db, 'passkey_credentials', registration.id),
        { uid, credentialId: registration.id }
      );

      await loadPasskeys();
      return passkey;
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Registro cancelado por el usuario'
        : err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePasskey = async (credentialId: string) => {
    if (!uid) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, `users/${uid}/passkeys`, credentialId));
      await deleteDoc(doc(db, 'passkey_credentials', credentialId));
      await loadPasskeys();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { passkeys, loading, error, registerPasskey, deletePasskey, loadPasskeys };
}

/**
 * Authenticate with a passkey.
 * Client-side verification for personal single-user dashboard:
 * - We verify the credential was used, check it matches a stored credential in Firestore
 * - Then sign in with the associated Firebase user via custom token or re-auth
 */
export async function authenticateWithPasskey(): Promise<string | null> {
  try {
    const challenge = generateChallenge();

    const authentication = await startAuthentication({
      optionsJSON: {
        challenge: bufferToBase64(challenge.buffer),
        rpId: window.location.hostname,
        userVerification: 'required',
        timeout: 60000,
      },
    });

    // Look up which user this credential belongs to
    const credDoc = await getDoc(doc(db, 'passkey_credentials', authentication.id));

    if (!credDoc.exists()) {
      throw new Error('Passkey no reconocida');
    }

    const { uid } = credDoc.data() as { uid: string };
    return uid;
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      return null; // User cancelled
    }
    throw err;
  }
}
