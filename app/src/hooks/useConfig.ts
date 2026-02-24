import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ConfigFile } from '@/types';

/**
 * Hook para obtener archivos de configuración
 */
export function useConfigFiles(instanceId: string) {
  const [files, setFiles] = useState<ConfigFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!instanceId) return;

    setLoading(true);
    const filesRef = collection(db, 'config', instanceId, 'files');

    const unsubscribe = onSnapshot(
      filesRef,
      (snapshot) => {
        const configFiles = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            name: d.name || doc.id + '.md',
            path: d.path || '',
            content: d.content || '',
            lastModified: d.lastModified ? new Date(d.lastModified) : new Date(),
            description: d.description || '',
          } as ConfigFile;
        });
        setFiles(configFiles);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching config files:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [instanceId]);

  return { files, loading, error };
}

/**
 * Hook para guardar ediciones pendientes
 */
export function useSaveConfigEdit(instanceId: string) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveEdit = async (fileName: string, newContent: string, originalContent: string) => {
    setSaving(true);
    setError(null);

    try {
      const pendingRef = collection(db, 'config', instanceId, 'pending');
      await addDoc(pendingRef, {
        fileName,
        newContent,
        originalContent,
        status: 'pending',
        createdAt: serverTimestamp(),
        createdBy: 'dashboard',
      });
      setSaving(false);
      return true;
    } catch (err: any) {
      console.error('Error saving edit:', err);
      setError(err);
      setSaving(false);
      return false;
    }
  };

  return { saveEdit, saving, error };
}
