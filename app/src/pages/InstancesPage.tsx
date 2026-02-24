import { useState } from 'react';
import {
  Title, Text, Button, SimpleGrid, Box, Group, Alert, Badge, Loader, Center,
  Modal, TextInput, Select, Stack,
} from '@mantine/core';
import { IconPlus, IconCheck, IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { InstanceCard } from '@/components/instances/InstanceCard';
import { useInstances } from '@/hooks/useFirestore';
import { notifications } from '@mantine/notifications';

const callSyncAll = httpsCallable(functions, 'syncAll');
const callRestartGateway = httpsCallable(functions, 'restartGateway');
const callUpdateInstance = httpsCallable(functions, 'updateInstance');

export function InstancesPage() {
  const { instances, loading } = useInstances();
  const [syncing, setSyncing] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newInst, setNewInst] = useState({ id: '', name: '', emoji: '🤖', host: '', port: '3033', location: 'vps', region: '' });
  const [saving, setSaving] = useState(false);

  const isLiveData = instances.length > 0;

  const handleSync = async () => {
    setSyncing(true);
    try {
      await callSyncAll();
      notifications.show({ title: '✅ Sincronizado', message: 'Estado actualizado', color: 'green' });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err?.message || 'No se pudo sincronizar', color: 'red' });
    }
    setSyncing(false);
  };

  const handleRestart = async (instanceId?: string) => {
    if (!confirm('¿Reiniciar el gateway de OpenClaw? Se interrumpirá temporalmente.')) return;
    
    try {
      notifications.show({ id: 'restart', title: 'Reiniciando...', message: `Enviando señal a ${instanceId}`, color: 'blue', loading: true, autoClose: false });
      
      await callRestartGateway({ instanceId });
      
      notifications.update({ id: 'restart', title: '✅ Reiniciado', message: 'Gateway reiniciado', color: 'green', loading: false, autoClose: 3000 });
      setTimeout(handleSync, 5000);
    } catch {
      notifications.update({ id: 'restart', title: 'Error', message: 'No se pudo reiniciar', color: 'red', loading: false, autoClose: 5000 });
    }
  };

  const handleUpdate = async (instanceId: string) => {
    if (!confirm(`¿Actualizar OpenClaw en ${instanceId}? Se reiniciará el gateway.`)) return;
    
    try {
      notifications.show({ id: 'update', title: '⬇️ Actualizando...', message: `Descargando última versión en ${instanceId}`, color: 'blue', loading: true, autoClose: false });
      
      const result: any = await callUpdateInstance({ instanceId });
      const version = result?.data?.data?.version || result?.data?.version || 'actualizado';
      
      notifications.update({ id: 'update', title: '✅ Actualizado', message: `${instanceId} → ${version}`, color: 'green', loading: false, autoClose: 5000 });
      setTimeout(handleSync, 3000);
    } catch (err: any) {
      notifications.update({ id: 'update', title: 'Error', message: err?.message || 'No se pudo actualizar', color: 'red', loading: false, autoClose: 5000 });
    }
  };

  const handleAddInstance = async () => {
    if (!newInst.id || !newInst.name || !newInst.host) {
      notifications.show({ title: 'Error', message: 'ID, nombre y host son obligatorios', color: 'red' });
      return;
    }

    setSaving(true);
    try {
      const serverKey = `${newInst.id}-openclaw-${new Date().getFullYear()}`;
      const syncToken = `${newInst.id}-sync-${Date.now().toString(36)}`;

      await setDoc(doc(db, 'instances', newInst.id), {
        name: newInst.name,
        emoji: newInst.emoji || '🤖',
        location: newInst.location || 'vps',
        region: newInst.region || '',
        host: newInst.host,
        port: parseInt(newInst.port) || 3033,
        syncToken,
        syncPort: 8787,
        status: 'pending',
        lastHeartbeat: new Date().toISOString(),
        version: 'pending',
        model: 'pending',
        primaryModel: '',
        fallbacks: [],
        createdAt: new Date().toISOString(),
        serverKey,
      });

      notifications.show({
        title: '✅ Instancia registrada',
        message: `${newInst.name} añadida. Configura el sync server en la máquina remota.`,
        color: 'green',
        autoClose: 8000,
      });
      setAddModalOpen(false);
      setNewInst({ id: '', name: '', emoji: '🤖', host: '', port: '3033', location: 'vps', region: '' });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err?.message || 'No se pudo registrar', color: 'red' });
    }
    setSaving(false);
  };

  if (loading) {
    return <Center h={400}><Loader size="lg" /></Center>;
  }

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2}>Instancias</Title>
          <Text c="dimmed" mt={4}>Gestiona tus instancias de OpenClaw</Text>
        </Box>
        <Group>
          <Button variant="light" leftSection={<IconRefresh size={18} />} onClick={handleSync} loading={syncing}>
            Actualizar estado
          </Button>
          <Button leftSection={<IconPlus size={18} />} onClick={() => setAddModalOpen(true)}>
            Añadir instancia
          </Button>
        </Group>
      </Group>

      <Alert color={isLiveData ? 'green' : 'orange'} mb="xl" icon={isLiveData ? <IconCheck /> : <IconAlertTriangle />}>
        <Group justify="space-between">
          <Text size="sm">
            {isLiveData
              ? <><strong>✅ DATOS REALES</strong> — {instances.length} instancia{instances.length > 1 ? 's' : ''} conectada{instances.length > 1 ? 's' : ''}</>
              : <><strong>⚠️ SIN DATOS</strong> — Pulsa &quot;Actualizar estado&quot; para sincronizar</>}
          </Text>
          <Badge color={isLiveData ? 'green' : 'orange'} variant="filled">{isLiveData ? 'LIVE' : 'OFFLINE'}</Badge>
        </Group>
      </Alert>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {instances.map((instance) => (
          <InstanceCard
            key={instance.id}
            instance={instance}
            isSelected={false}
            onSelect={() => {}}
            onRestart={() => handleRestart(instance.id)}
            onUpdate={() => handleUpdate(instance.id)}
          />
        ))}
      </SimpleGrid>

      {/* Add Instance Modal */}
      <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Añadir instancia" size="md">
        <Stack gap="md">
          <TextInput
            label="ID de instancia"
            placeholder="bot2, alvi-dev..."
            description="Identificador único (sin espacios)"
            value={newInst.id}
            onChange={(e) => setNewInst({ ...newInst, id: e.currentTarget.value.replace(/\s/g, '-').toLowerCase() })}
            required
          />
          <TextInput
            label="Nombre"
            placeholder="Bot Producción"
            value={newInst.name}
            onChange={(e) => setNewInst({ ...newInst, name: e.currentTarget.value })}
            required
          />
          <Group grow>
            <TextInput
              label="Emoji"
              placeholder="🤖"
              value={newInst.emoji}
              onChange={(e) => setNewInst({ ...newInst, emoji: e.currentTarget.value })}
              w={80}
            />
            <Select
              label="Ubicación"
              data={[
                { value: 'gcloud', label: '☁️ Google Cloud' },
                { value: 'vps', label: '🖥️ VPS' },
                { value: 'local', label: '🏠 Local' },
              ]}
              value={newInst.location}
              onChange={(v) => setNewInst({ ...newInst, location: v || 'vps' })}
            />
          </Group>
          <Group grow>
            <TextInput
              label="Host (IP o dominio)"
              placeholder="1.2.3.4"
              value={newInst.host}
              onChange={(e) => setNewInst({ ...newInst, host: e.currentTarget.value })}
              required
            />
            <TextInput
              label="Puerto gateway"
              placeholder="3033"
              value={newInst.port}
              onChange={(e) => setNewInst({ ...newInst, port: e.currentTarget.value })}
              w={100}
            />
          </Group>
          <TextInput
            label="Región (opcional)"
            placeholder="europe-west1"
            value={newInst.region}
            onChange={(e) => setNewInst({ ...newInst, region: e.currentTarget.value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddInstance} loading={saving}>Registrar</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
