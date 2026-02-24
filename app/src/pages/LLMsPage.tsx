import { useState, useEffect, useMemo, Component, type ReactNode } from 'react';
import {
  Box, Title, Text, Button, SimpleGrid, Paper, Group, Badge, Stack, Alert,
  Loader, Center, Select, ActionIcon, Divider, Table, Switch, Card,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconCheck, IconAlertTriangle, IconRefresh, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useLLMProviders, useModelCatalog, useInstances, useInstanceModelConfig } from '@/hooks/useFirestore';
import { LLMProviderModal } from '@/components/llm/LLMProviderModal';

const DEFAULT_INSTANCE = 'alvi';

// Cloud Functions for HTTPS-safe sync (no mixed content issues)
const callSyncLLMs = httpsCallable(functions, 'syncLLMs');
const callSyncLLMsPull = httpsCallable(functions, 'syncLLMsPull');
const callRefreshCatalog = httpsCallable(functions, 'refreshCatalog');

// Error boundary
class LLMErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <Box p="xl">
          <Alert color="red" title="Error en LLM Manager">
            <Text size="sm" mb="xs">{this.state.error.message}</Text>
            <Text size="xs" c="dimmed" ff="monospace" style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error.stack?.slice(0, 500)}
            </Text>
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}

export function LLMsPage() {
  return <LLMErrorBoundary><LLMsPageInner /></LLMErrorBoundary>;
}

function LLMsPageInner() {
  const { instances } = useInstances();
  const { providers: rawProviders, loading } = useLLMProviders();
  const { catalog } = useModelCatalog();
  const [selectedInstance, setSelectedInstance] = useState(DEFAULT_INSTANCE);
  const instanceModelConfig = useInstanceModelConfig(selectedInstance);
  const [syncing, setSyncing] = useState(false);
  const [refreshingCatalog, setRefreshingCatalog] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [primaryModel, setPrimaryModel] = useState('');
  const [fallbacks, setFallbacks] = useState<string[]>([]);
  const [applyingConfig, setApplyingConfig] = useState(false);

  // Ensure providers is always a safe array
  const providers = Array.isArray(rawProviders) ? rawProviders : [];

  // Sync from instance model config
  useEffect(() => {
    if (instanceModelConfig) {
      setPrimaryModel(instanceModelConfig.primaryModel || '');
      setFallbacks(Array.isArray(instanceModelConfig.fallbacks) ? instanceModelConfig.fallbacks : []);
    }
  }, [instanceModelConfig?.primaryModel, selectedInstance]);

  // Build flat model list from Firestore catalog (dynamic)
  const modelOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const seen = new Set<string>();
    
    for (const [provKey, cat] of Object.entries(catalog)) {
      if (!cat || !Array.isArray(cat.models)) continue;
      for (const m of cat.models) {
        if (!m || !m.id) continue;
        const val = `${provKey}/${m.id}`;
        if (seen.has(val)) continue;
        seen.add(val);
        opts.push({ value: val, label: `${cat.icon || '⚪'} ${m.name || m.id}` });
      }
    }
    return opts;
  }, [catalog]);

  // Pricing data from catalog
  const pricingModels = useMemo(() => {
    const all: { providerId: string; providerName: string; icon: string; modelId: string; modelName: string; input: number; output: number }[] = [];
    for (const [pid, cat] of Object.entries(catalog)) {
      if (!cat || !Array.isArray(cat.models)) continue;
      for (const m of cat.models) {
        if (!m || !m.id) continue;
        // Only include models with known pricing
        if ((m.input || 0) > 0 || (m.output || 0) > 0) {
          all.push({
            providerId: pid,
            providerName: cat.name || pid,
            icon: cat.icon || '⚪',
            modelId: m.id,
            modelName: m.name || m.id,
            input: m.input || 0,
            output: m.output || 0,
          });
        }
      }
    }
    return all.sort((a, b) => (a.input || 0) - (b.input || 0));
  }, [catalog]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await callSyncLLMs({ instanceId: selectedInstance });
      console.log('syncLLMs result:', result);
      notifications.show({ title: '✅ Sincronizado', message: 'LLMs actualizados desde servidor', color: 'green' });
    } catch (err: any) {
      console.error('syncLLMs error:', err);
      const msg = err?.message || err?.code || 'No se pudo sincronizar';
      notifications.show({ title: 'Error sync', message: msg, color: 'red' });
    }
    setSyncing(false);
  };

  const handleRefreshCatalog = async () => {
    setRefreshingCatalog(true);
    try {
      await callRefreshCatalog({ instanceId: selectedInstance });
      notifications.show({ title: '✅ Catálogo actualizado', message: 'Modelos consultados desde las APIs de los proveedores', color: 'green' });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err?.message || 'No se pudo actualizar el catálogo', color: 'red' });
    }
    setRefreshingCatalog(false);
  };

  const handleApply = async () => {
    if (!primaryModel) return;
    setApplyingConfig(true);
    try {
      // Write model config to instance doc
      await setDoc(doc(db, 'instances', selectedInstance), {
        primaryModel,
        fallbacks: fallbacks.filter(Boolean),
        lastModelUpdate: new Date().toISOString(),
        serverKey: `${selectedInstance}-openclaw-2026`,
      }, { merge: true });
      
      // Also update legacy llms doc for backward compat
      await setDoc(doc(db, 'llms', selectedInstance), {
        primaryModel,
        fallbacks: fallbacks.filter(Boolean),
        providerCount: providers.length,
        lastSync: new Date().toISOString(),
        serverKey: `${selectedInstance}-openclaw-2026`,
      }, { merge: true });
      
      notifications.show({ title: '✅ Guardado', message: 'Configuración guardada', color: 'green' });

      // Sync to server via Cloud Function
      try {
        await callSyncLLMsPull({ instanceId: selectedInstance });
        notifications.show({ title: '🔄 Sincronizado', message: 'Servidor actualizado', color: 'teal' });
      } catch {
        notifications.show({ title: '⚠️ Sync pendiente', message: 'Guardado en Firestore. Se sincronizará en el próximo heartbeat.', color: 'yellow' });
      }
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err?.message || 'No se pudo guardar en Firestore', color: 'red' });
    }
    setApplyingConfig(false);
  };

  const handleSaveProvider = async (data: any) => {
    try {
      const pid = data.provider;
      // Write to legacy per-instance path (current working path)
      await setDoc(doc(db, 'llms', 'alvi', 'providers', pid), {
        id: pid,
        provider: data.provider,
        name: data.name,
        icon: data.icon,
        apiKey: data.apiKey || '',
        apiKeyMasked: data.apiKey ? (data.apiKey.slice(0, 4) + '••••' + data.apiKey.slice(-4)) : '',
        baseUrl: data.baseUrl || '',
        isActive: data.isActive ?? true,
        hasKey: !!data.apiKey,
        models: Array.isArray(data.models) ? data.models : [],
        serverKey: 'alvi-openclaw-2026',
        updatedAt: new Date().toISOString(),
      }, { merge: !!editingProvider });

      notifications.show({ title: '✅ Guardado', message: `${data.name} configurado`, color: 'green' });
      
      // Sync to server via Cloud Function
      try { await callSyncLLMsPull({ instanceId: selectedInstance }); } catch {}
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err?.message || 'Error guardando', color: 'red' });
    }
  };

  const handleDeleteProvider = async (pid: string) => {
    try {
      await deleteDoc(doc(db, 'llms', 'alvi', 'providers', pid));
      notifications.show({ title: 'Eliminado', message: 'Proveedor eliminado', color: 'orange' });
    } catch {
      notifications.show({ title: 'Error', message: 'No se pudo eliminar', color: 'red' });
    }
  };

  const handleToggle = async (pid: string, active: boolean) => {
    try {
      await setDoc(doc(db, 'llms', 'alvi', 'providers', pid), { isActive: active, serverKey: 'alvi-openclaw-2026' }, { merge: true });
    } catch {}
  };

  const addFallback = () => { if (fallbacks.length < 3) setFallbacks([...fallbacks, '']); };
  const removeFallback = (i: number) => setFallbacks(fallbacks.filter((_, idx) => idx !== i));
  const updateFallback = (i: number, v: string) => { const n = [...fallbacks]; n[i] = v; setFallbacks(n); };
  const moveFallback = (i: number, d: -1 | 1) => {
    const n = [...fallbacks]; const t = i + d;
    if (t < 0 || t >= n.length) return;
    [n[i], n[t]] = [n[t], n[i]]; setFallbacks(n);
  };

  if (loading) return <Center h={400}><Loader size="lg" /></Center>;

  const hasChanges = primaryModel !== (instanceModelConfig?.primaryModel || '') ||
    JSON.stringify(fallbacks.filter(Boolean)) !== JSON.stringify(Array.isArray(instanceModelConfig?.fallbacks) ? instanceModelConfig.fallbacks : []);

  // Instance selector options
  const instanceOptions = instances.map(inst => ({
    value: inst.id,
    label: `${inst.emoji || '🤖'} ${inst.name}`,
  }));

  return (
    <Box p="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2}>🤖 Gestor de LLMs</Title>
          <Text c="dimmed" mt={4}>Modelos de IA, proveedores y configuración</Text>
        </Box>
        <Group>
          <Button variant="light" leftSection={<IconRefresh size={18} />} onClick={handleRefreshCatalog} loading={refreshingCatalog}>Actualizar catálogo</Button>
          <Button variant="light" leftSection={<IconRefresh size={18} />} onClick={handleSync} loading={syncing}>Sincronizar</Button>
          <Button leftSection={<IconPlus size={18} />} onClick={() => { setEditingProvider(null); setModalOpened(true); }}>Añadir proveedor</Button>
        </Group>
      </Group>

      {/* Status */}
      <Alert color={providers.length > 0 ? 'green' : 'orange'} mb="xl" icon={providers.length > 0 ? <IconCheck /> : <IconAlertTriangle />}>
        <Group justify="space-between">
          <Text size="sm">
            {providers.length > 0
              ? <><strong>✅ DATOS REALES</strong> — {providers.length} proveedores · {modelOptions.length} modelos en catálogo</>
              : <><strong>⚠️ SIN PROVEEDORES</strong> — Añade uno para comenzar</>}
          </Text>
          <Badge color={providers.length > 0 ? 'green' : 'orange'} variant="filled">
            {providers.length > 0 ? 'LIVE' : 'VACÍO'}
          </Badge>
        </Group>
      </Alert>

      {/* A) Model Selector */}
      <Paper p="lg" mb="xl" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>🎯 Modelo Activo</Title>
          {instanceOptions.length > 1 && (
            <Select
              size="sm"
              placeholder="Instancia"
              data={instanceOptions}
              value={selectedInstance}
              onChange={(v) => v && setSelectedInstance(v)}
              w={200}
            />
          )}
          {instanceOptions.length <= 1 && (
            <Badge variant="light" size="lg">{instances[0]?.emoji || '🦉'} {instances[0]?.name || 'Alvi'}</Badge>
          )}
        </Group>
        <Stack gap="md">
          <Select
            label="Modelo principal"
            placeholder="Selecciona..."
            data={modelOptions}
            value={primaryModel || null}
            onChange={(v) => setPrimaryModel(v || '')}
            searchable
            clearable
          />
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>Fallbacks (máx. 3)</Text>
              {fallbacks.length < 3 && (
                <Button size="xs" variant="light" onClick={addFallback} leftSection={<IconPlus size={14} />}>Añadir</Button>
              )}
            </Group>
            <Stack gap="xs">
              {fallbacks.map((fb, idx) => (
                <Group key={idx} gap="xs">
                  <Badge size="sm" variant="outline" w={24}>{idx + 1}</Badge>
                  <Select
                    flex={1}
                    placeholder={`Fallback ${idx + 1}...`}
                    data={modelOptions}
                    value={fb || null}
                    onChange={(v) => updateFallback(idx, v || '')}
                    searchable
                    clearable
                  />
                  <ActionIcon variant="subtle" size="sm" onClick={() => moveFallback(idx, -1)} disabled={idx === 0}><IconArrowUp size={14} /></ActionIcon>
                  <ActionIcon variant="subtle" size="sm" onClick={() => moveFallback(idx, 1)} disabled={idx === fallbacks.length - 1}><IconArrowDown size={14} /></ActionIcon>
                  <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeFallback(idx)}><IconTrash size={14} /></ActionIcon>
                </Group>
              ))}
            </Stack>
          </Box>
          <Group justify="flex-end">
            <Button onClick={handleApply} loading={applyingConfig} disabled={!primaryModel || !hasChanges}>
              Aplicar configuración
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* B) Provider Cards */}
      <Title order={4} mb="md">📦 Proveedores</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
        {providers.map((p) => (
          <Card key={p.id || p.provider} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Group gap="sm">
                <Text size="2rem">{p.icon || '⚪'}</Text>
                <Box>
                  <Text fw={600}>{p.name || p.provider}</Text>
                  <Text size="xs" c="dimmed">
                    {catalog[p.provider]?.models?.length ?? (Array.isArray(p.models) ? p.models.length : 0)} modelos
                  </Text>
                </Box>
              </Group>
              <Switch
                checked={p.isActive ?? true}
                onChange={(e) => handleToggle(p.id, e.currentTarget.checked)}
                size="sm"
              />
            </Group>
            <Text size="xs" c="dimmed" ff="monospace" mb="xs">
              {p.isProtected ? '🛡️ OpenClaw managed' : (p.apiKeyMasked || (p.hasKey ? '••••' : 'Sin key'))}
            </Text>
            <Group gap={4} wrap="wrap" mb="md">
              {((catalog[p.provider]?.models || p.models || []).slice(0, 3)).map((m: any, i: number) => (
                <Badge key={i} variant="light" size="xs">
                  {typeof m === 'string' ? m : (m?.name || m?.id || '?')}
                </Badge>
              ))}
            </Group>
            <Group gap="xs">
              <Button size="xs" variant="light" onClick={() => { setEditingProvider(p); setModalOpened(true); }}
                disabled={p.isProtected}>
                Editar
              </Button>
              {!p.isProtected && (
                <Button size="xs" variant="light" color="red" onClick={() => handleDeleteProvider(p.id)}>
                  Eliminar
                </Button>
              )}
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Divider my="xl" />

      {/* D) Pricing Table */}
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Box>
            <Title order={4}>💰 Tabla de Precios</Title>
            <Text size="sm" c="dimmed">$/1M tokens, ordenados por coste</Text>
          </Box>
          <Badge variant="light" color="gray">{pricingModels.length} modelos</Badge>
        </Group>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Proveedor</Table.Th>
              <Table.Th>Modelo</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Input</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Output</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pricingModels.map((m, i) => {
              const avg = ((m.input || 0) + (m.output || 0)) / 2;
              const color = avg === 0 ? 'green' : avg < 0.5 ? 'teal' : avg < 3 ? 'yellow' : avg < 15 ? 'orange' : 'red';
              return (
                <Table.Tr key={i}>
                  <Table.Td><Group gap={4}><Text size="sm">{m.icon}</Text><Text size="sm">{m.providerName}</Text></Group></Table.Td>
                  <Table.Td><Text size="sm">{m.modelName}</Text></Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}><Badge size="sm" variant="light" color={color}>${(m.input || 0).toFixed(2)}</Badge></Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}><Badge size="sm" variant="light" color={color}>${(m.output || 0).toFixed(2)}</Badge></Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Modal */}
      <LLMProviderModal
        opened={modalOpened}
        onClose={() => { setModalOpened(false); setEditingProvider(null); }}
        onSubmit={handleSaveProvider}
        editingProvider={editingProvider}
        catalog={catalog}
      />
    </Box>
  );
}
