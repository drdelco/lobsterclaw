import { useState } from 'react';
import { Box, Title, Text, Button, Table, Paper, Group, TextInput, Badge, Stack, Alert, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconSearch, IconCalendarOff, IconCheck, IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { useCronJobs } from '@/hooks/useFirestore';

export function CronJobsPage() {
  const { jobs: firestoreJobs, loading, error } = useCronJobs('alvi');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  const isLiveData = firestoreJobs.length > 0 && !error;

  // Use Firestore jobs directly
  const jobs = firestoreJobs;

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    return job.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const enabledCount = jobs.filter(j => j.enabled).length;

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('http://35.241.159.137:8787/sync/crons', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer lobsterclaw-sync-2026' },
      });
      if (response.ok) {
        notifications.show({
          title: 'Sincronizado',
          message: 'Cron jobs actualizados',
          color: 'green',
        });
        window.location.reload();
      }
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo sincronizar',
        color: 'red',
      });
    }
    setSyncing(false);
  };

  const handleAction = () => {
    notifications.show({
      title: 'Próximamente',
      message: 'Esta función estará disponible pronto',
      color: 'blue',
    });
  };

  const formatSchedule = (schedule: any) => {
    if (!schedule) return 'Sin programar';
    if (schedule.kind === 'cron') {
      return `Cron: ${schedule.expr}${schedule.tz ? ` (${schedule.tz})` : ''}`;
    }
    if (schedule.kind === 'every') {
      const mins = Math.round(schedule.everyMs / 60000);
      if (mins >= 60) return `Cada ${Math.round(mins / 60)}h`;
      return `Cada ${mins}min`;
    }
    if (schedule.kind === 'at') {
      return `Una vez: ${new Date(schedule.at).toLocaleString('es-ES')}`;
    }
    return JSON.stringify(schedule);
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2}>Cron Jobs</Title>
          <Text c="dimmed" mt={4}>
            Tareas programadas de OpenClaw
          </Text>
        </Box>
        <Group>
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={18} />}
            onClick={handleSync}
            loading={syncing}
          >
            Sincronizar
          </Button>
          <Button 
            leftSection={<IconPlus size={18} />} 
            onClick={() => notifications.show({ message: 'Usa Telegram para crear crons', color: 'blue' })}
          >
            Nuevo cron
          </Button>
        </Group>
      </Group>

      {/* Data source indicator */}
      {isLiveData ? (
        <Alert color="green" mb="xl" icon={<IconCheck />}>
          <Group justify="space-between">
            <Text size="sm">
              <strong>✅ DATOS REALES</strong> — {jobs.length} cron jobs ({enabledCount} activos)
            </Text>
            <Badge color="green" variant="filled">LIVE</Badge>
          </Group>
        </Alert>
      ) : (
        <Alert color="orange" mb="xl" icon={<IconAlertTriangle />}>
          <Group justify="space-between">
            <Text size="sm">
              <strong>⚠️ SIN DATOS</strong> — No se pudieron cargar los cron jobs
            </Text>
            <Badge color="orange" variant="filled">OFFLINE</Badge>
          </Group>
        </Alert>
      )}

      {/* Search */}
      <Group mb="lg">
        <TextInput
          placeholder="Buscar cron jobs..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 300 }}
        />
      </Group>

      {/* Jobs table */}
      {filteredJobs.length > 0 ? (
        <Paper radius="md" withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Programación</Table.Th>
                <Table.Th>Próxima ejecución</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredJobs.map((job) => (
                <Table.Tr key={job.id}>
                  <Table.Td>
                    <Badge color={job.enabled ? 'green' : 'gray'} variant="light">
                      {job.enabled ? 'Activo' : 'Pausado'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500}>{job.name}</Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {job.payload?.kind === 'agentTurn' 
                        ? job.payload.message?.slice(0, 60) + '...'
                        : job.payload?.text?.slice(0, 60) + '...'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatSchedule(job.schedule)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {job.nextRun 
                        ? new Date(job.nextRun).toLocaleString('es-ES', { 
                            day: 'numeric', 
                            month: 'short', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="subtle" onClick={handleAction}>
                        Ejecutar
                      </Button>
                      <Button size="xs" variant="subtle" onClick={handleAction}>
                        {job.enabled ? 'Pausar' : 'Activar'}
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      ) : (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md" py="xl">
            <IconCalendarOff size={48} style={{ opacity: 0.5 }} />
            <Text c="dimmed">
              {searchQuery ? 'No hay crons que coincidan con la búsqueda' : 'No hay cron jobs configurados'}
            </Text>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
