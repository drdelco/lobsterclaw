import { useState } from 'react';
import { Box, Title, Text, Button, Table, Paper, Group, TextInput, Select, Badge, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconSearch, IconCalendarOff } from '@tabler/icons-react';
import { CronJobRow } from '@/components/cron/CronJobRow';
import { CronJobModal } from '@/components/cron/CronJobModal';
import type { CronJob, Instance } from '@/types';

// Mock data
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
    lastHeartbeat: new Date(),
    version: '2026.2.3-1',
    model: 'anthropic/claude-opus-4-5',
    createdAt: new Date('2026-02-08'),
  },
];

const mockCronJobs: CronJob[] = [
  {
    id: 'email-check',
    instanceId: 'alvi',
    name: 'Revisión de emails',
    schedule: { kind: 'every', everyMs: 30 * 60 * 1000 },
    payload: { kind: 'systemEvent', text: 'Revisa los emails pendientes de Diego y Juani' },
    enabled: true,
    lastRun: new Date(Date.now() - 15 * 60 * 1000),
    lastStatus: 'success',
    nextRun: new Date(Date.now() + 15 * 60 * 1000),
  },
  {
    id: 'weekly-papers',
    instanceId: 'alvi',
    name: 'Papers semanales',
    schedule: { kind: 'cron', expr: '0 9 * * 1' },
    payload: { kind: 'agentTurn', message: 'Busca papers relevantes de cirugía de columna de la última semana' },
    enabled: true,
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastStatus: 'success',
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'morning-briefing',
    instanceId: 'alvi',
    name: 'Briefing matutino',
    schedule: { kind: 'cron', expr: '30 7 * * *' },
    payload: { kind: 'systemEvent', text: 'Prepara el briefing matutino para Diego y Juani' },
    enabled: false,
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastStatus: 'success',
  },
];

export function CronJobsPage() {
  const [jobs, setJobs] = useState<CronJob[]>(mockCronJobs);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingJob, setEditingJob] = useState<CronJob | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [instanceFilter, setInstanceFilter] = useState<string | null>(null);

  const instances = mockInstances; // TODO: Get from store

  const getInstanceName = (instanceId: string) => {
    const instance = instances.find((i) => i.id === instanceId);
    return instance ? `${instance.emoji || '🤖'} ${instance.name}` : instanceId;
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !searchQuery || 
      job.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInstance = !instanceFilter || job.instanceId === instanceFilter;
    return matchesSearch && matchesInstance;
  });

  const handleCreateJob = () => {
    setEditingJob(undefined);
    openModal();
  };

  const handleEditJob = (job: CronJob) => {
    setEditingJob(job);
    openModal();
  };

  const handleSubmitJob = (jobData: Partial<CronJob>) => {
    if (editingJob) {
      // Update existing
      setJobs(jobs.map((j) => (j.id === editingJob.id ? { ...j, ...jobData } : j)));
      notifications.show({
        title: 'Job actualizado',
        message: `"${jobData.name}" ha sido actualizado`,
        color: 'blue',
      });
    } else {
      // Create new
      const newJob: CronJob = {
        id: `job-${Date.now()}`,
        instanceId: jobData.instanceId!,
        name: jobData.name!,
        schedule: jobData.schedule!,
        payload: jobData.payload!,
        enabled: true,
      };
      setJobs([...jobs, newJob]);
      notifications.show({
        title: 'Job creado',
        message: `"${jobData.name}" ha sido creado`,
        color: 'green',
      });
    }
  };

  const handleRunJob = (job: CronJob) => {
    notifications.show({
      title: 'Ejecutando job',
      message: `"${job.name}" se está ejecutando...`,
      color: 'blue',
      loading: true,
    });
    // TODO: Call cron run API
  };

  const handleToggleJob = (job: CronJob) => {
    setJobs(jobs.map((j) => (j.id === job.id ? { ...j, enabled: !j.enabled } : j)));
    notifications.show({
      message: job.enabled ? `"${job.name}" desactivado` : `"${job.name}" activado`,
      color: job.enabled ? 'yellow' : 'green',
    });
  };

  const handleDeleteJob = (job: CronJob) => {
    modals.openConfirmModal({
      title: 'Eliminar cron job',
      children: (
        <Text size="sm">
          ¿Estás seguro de que quieres eliminar "{job.name}"? Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setJobs(jobs.filter((j) => j.id !== job.id));
        notifications.show({
          title: 'Job eliminado',
          message: `"${job.name}" ha sido eliminado`,
          color: 'red',
        });
      },
    });
  };

  const activeCount = jobs.filter((j) => j.enabled).length;

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Group gap="sm">
            <Title order={2}>Cron Jobs</Title>
            <Badge variant="light" size="lg">
              {activeCount} activos
            </Badge>
          </Group>
          <Text c="dimmed" mt={4}>
            Tareas programadas de tus instancias
          </Text>
        </Box>
        <Button leftSection={<IconPlus size={18} />} onClick={handleCreateJob}>
          Nuevo Job
        </Button>
      </Group>

      {/* Filters */}
      <Paper p="md" radius="md" withBorder mb="lg">
        <Group>
          <TextInput
            placeholder="Buscar por nombre..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Todas las instancias"
            clearable
            data={instances.map((i) => ({ value: i.id, label: `${i.emoji || '🤖'} ${i.name}` }))}
            value={instanceFilter}
            onChange={setInstanceFilter}
            w={200}
          />
        </Group>
      </Paper>

      {/* Table */}
      {filteredJobs.length > 0 ? (
        <Paper radius="md" withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Instancia</Table.Th>
                <Table.Th>Programación</Table.Th>
                <Table.Th>Tarea</Table.Th>
                <Table.Th>Última ejecución</Table.Th>
                <Table.Th>Próxima</Table.Th>
                <Table.Th>Activo</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredJobs.map((job) => (
                <CronJobRow
                  key={job.id}
                  job={job}
                  instanceName={getInstanceName(job.instanceId)}
                  onRun={() => handleRunJob(job)}
                  onEdit={() => handleEditJob(job)}
                  onDelete={() => handleDeleteJob(job)}
                  onToggle={() => handleToggleJob(job)}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      ) : (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md" py="xl">
            <IconCalendarOff size={48} style={{ opacity: 0.5 }} />
            <Text c="dimmed">
              {searchQuery || instanceFilter
                ? 'No hay jobs que coincidan con los filtros'
                : 'No hay cron jobs configurados'}
            </Text>
            {!searchQuery && !instanceFilter && (
              <Button leftSection={<IconPlus size={18} />} onClick={handleCreateJob}>
                Crear tu primer job
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {/* Modal */}
      <CronJobModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={handleSubmitJob}
        instances={instances}
        editingJob={editingJob}
      />
    </Box>
  );
}
