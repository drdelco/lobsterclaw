import { Title, Text, Button, SimpleGrid, Box, Group, Paper, Stack } from '@mantine/core';
import { IconPlus, IconServerOff } from '@tabler/icons-react';
import { InstanceCard } from '@/components/instances/InstanceCard';
import { useInstanceStore } from '@/stores/instanceStore';
import type { Instance } from '@/types';

// Mock data for development
const mockInstances: Instance[] = [
  {
    id: 'alvi',
    name: 'Alvi',
    emoji: '🦉',
    location: 'gcloud',
    host: 'localhost',
    port: 3033,
    gatewayToken: '***',
    status: 'online',
    lastHeartbeat: new Date(Date.now() - 5 * 60 * 1000),
    version: '2026.2.3-1',
    model: 'anthropic/claude-opus-4-5',
    createdAt: new Date('2026-02-08'),
  },
];

export function InstancesPage() {
  const { instances, selectedInstance, selectInstance } = useInstanceStore();

  // Use mock data if no instances loaded
  const displayInstances = instances.length > 0 ? instances : mockInstances;

  const handleRestart = async (instanceId: string) => {
    console.log('Restarting instance:', instanceId);
    // TODO: Call gateway restart
  };

  const handleAddInstance = () => {
    // TODO: Open add instance modal
    console.log('Add instance');
  };

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2}>Instancias</Title>
          <Text c="dimmed" mt={4}>
            Gestiona tus instancias de OpenClaw
          </Text>
        </Box>
        <Button leftSection={<IconPlus size={18} />} onClick={handleAddInstance}>
          Añadir instancia
        </Button>
      </Group>

      {displayInstances.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {displayInstances.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              isSelected={selectedInstance?.id === instance.id}
              onSelect={() => selectInstance(instance)}
              onRestart={() => handleRestart(instance.id)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md" py="xl">
            <IconServerOff size={48} style={{ opacity: 0.5 }} />
            <Text c="dimmed">No hay instancias configuradas</Text>
            <Button leftSection={<IconPlus size={18} />} onClick={handleAddInstance}>
              Añadir tu primera instancia
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
