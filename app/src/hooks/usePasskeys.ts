import { useState, useEffect } from 'react';

export function usePasskeys(userId?: string) {
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    // Stub: passkeys not implemented yet
    setPasskeys([]);
  }, [userId]);

  const registerPasskey = async (label: string) => {
    console.log('Register passkey stub:', label);
    return { success: false, error: 'Not implemented' };
  };

  const deletePasskey = async (id: string) => {
    console.log('Delete passkey stub:', id);
    return { success: false };
  };

  return { passkeys, loading, error, registerPasskey, deletePasskey };
}
