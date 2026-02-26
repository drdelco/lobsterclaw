import { useState, useEffect } from 'react';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Instance, MonthlyCost } from '@/types';

/**
 * Hook para obtener datos de una instancia
 */
export function useInstance(instanceId: string) {
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!instanceId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'instances', instanceId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setInstance({
            id: snapshot.id,
            name: data.name || 'Unknown',
            emoji: data.emoji || '🤖',
            location: data.location || 'unknown',
            host: data.host || 'localhost',
            port: data.port || 3033,
            gatewayToken: '***',
            status: data.status || 'offline',
            lastHeartbeat: data.lastHeartbeat ? new Date(data.lastHeartbeat) : new Date(),
            version: data.version || 'unknown',
            model: data.model || 'unknown',
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          });
        } else {
          setInstance(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching instance:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [instanceId]);

  return { instance, loading, error };
}

/**
 * Hook para obtener todas las instancias
 */
export function useInstances() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'instances'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || 'Unknown',
            emoji: d.emoji || '🤖',
            location: d.location || 'unknown',
            region: d.region || undefined,
            host: d.host || 'localhost',
            port: d.port || 3033,
            gatewayToken: '***',
            status: d.status || 'offline',
            lastHeartbeat: d.lastHeartbeat || new Date().toISOString(),
            version: d.version || 'unknown',
            model: d.model || 'unknown',
            fallbacks: d.fallbacks || [],
            pid: d.pid || undefined,
            uptimeSeconds: d.uptimeSeconds || 0,
            createdAt: d.createdAt || new Date().toISOString(),
            hostname: d.hostname || undefined,
            platform: d.platform || undefined,
            cpus: d.cpus || undefined,
            memoryTotalGB: d.memoryTotalGB || undefined,
            memoryUsedPct: d.memoryUsedPct || undefined,
            diskTotalGB: d.diskTotalGB || undefined,
            diskUsedPct: d.diskUsedPct || undefined,
            loadAvg1m: d.loadAvg1m || undefined,
            nodeVersion: d.nodeVersion || undefined,
            lastSync: d.lastSync || undefined,
          } as Instance;
        });
        setInstances(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching instances:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { instances, loading, error };
}

/**
 * Hook para obtener costes de un mes específico
 */
export function useMonthlyCosts(instanceId: string, month: string) {
  const [costs, setCosts] = useState<MonthlyCost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!instanceId || !month) return;

    const unsubscribe = onSnapshot(
      doc(db, 'costs', instanceId, 'months', month),
      (snapshot) => {
        if (snapshot.exists()) {
          const d = snapshot.data();
          setCosts({
            instanceId: d.instanceId || instanceId,
            month: d.month || month,
            total: d.total || 0,
            budget: d.budget || 100,
            byProvider: d.byProvider || {},
            byModel: d.byModel || {},
            tokensByModel: d.tokensByModel || {},
            dailyCosts: d.dailyCosts || [],
          });
        } else {
          setCosts(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching costs:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [instanceId, month]);

  return { costs, loading, error };
}

/**
 * Hook para obtener resumen de costes
 */
export function useCostsSummary(instanceId: string) {
  const [summary, setSummary] = useState<{
    totalMtd: number;
    totalApi: number;
    totalInfra: number;
    budget: number;
    lastUpdated: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!instanceId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'summary', instanceId),
      (snapshot) => {
        if (snapshot.exists()) {
          const d = snapshot.data();
          setSummary({
            totalMtd: d.totalMtd || 0,
            totalApi: d.totalApi || 0,
            totalInfra: d.totalInfra || 0,
            budget: d.budget || 100,
            lastUpdated: d.lastUpdated || '',
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching summary:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [instanceId]);

  return { summary, loading };
}

/**
 * Hook para obtener cron jobs
 */
export function useCronJobs(instanceId: string) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!instanceId) return;

    const jobsRef = collection(db, 'crons', instanceId, 'jobs');

    const unsubscribe = onSnapshot(
      jobsRef,
      (snapshot) => {
        const cronJobs = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: d.id || doc.id,
            instanceId: d.instanceId || instanceId,
            name: d.name || 'Sin nombre',
            schedule: d.schedule || {},
            payload: d.payload || {},
            enabled: d.enabled ?? true,
            lastRun: d.lastRun ? new Date(d.lastRun) : undefined,
            nextRun: d.nextRun ? new Date(d.nextRun) : undefined,
            createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
          };
        });
        setJobs(cronJobs);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching cron jobs:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [instanceId]);

  return { jobs, loading, error };
}

/**
 * Hook para obtener LLM providers
 */
/**
 * Hook para obtener proveedores LLM compartidos (globales)
 */
export function useLLMProviders() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Read providers from legacy path (llms/alvi/providers)
    const sharedRef = collection(db, 'llms', 'alvi', 'providers');
    const unsub = onSnapshot(sharedRef, (snapshot) => {
      const llmProviders = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          provider: data.provider,
          name: data.name,
          icon: data.icon,
          mode: data.mode,
          isActive: data.isActive ?? true,
          models: data.models || [],
          isPrimary: data.isPrimary ?? false,
          apiKeyMasked: data.apiKeyMasked || '',
          hasKey: data.hasKey ?? false,
          isProtected: data.isProtected ?? false,
        };
      });
      setProviders(llmProviders);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { providers, loading, error };
}

/**
 * Hook para obtener la config de modelo de una instancia específica
 */
export function useInstanceModelConfig(instanceId: string) {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    if (!instanceId) return;

    // Read from instances/{id} for model config
    const instanceRef = doc(db, 'instances', instanceId);
    const unsub = onSnapshot(instanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setConfig({
          primaryModel: data.primaryModel || '',
          fallbacks: Array.isArray(data.fallbacks) ? data.fallbacks : [],
        });
      }
    });

    return () => unsub();
  }, [instanceId]);

  return config;
}

/**
 * Hook para obtener el catálogo de modelos de Firestore (dinámico, no hardcodeado)
 */
export function useModelCatalog() {
  const [catalog, setCatalog] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Shared catalog: llms/alvi/catalog (legacy path, works for all)
    const catalogRef = collection(db, 'llms', 'alvi', 'catalog');
    const unsub = onSnapshot(catalogRef, (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.docs.forEach((doc) => {
        if (doc.id === '_summary') return;
        const d = doc.data();
        data[doc.id] = {
          provider: d.provider || doc.id,
          name: d.name || doc.id,
          icon: d.icon || '⚪',
          models: d.models || [],
          modelCount: d.modelCount || 0,
          lastFetch: d.lastFetch || '',
        };
      });
      setCatalog(data);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, []);

  return { catalog, loading };
}
