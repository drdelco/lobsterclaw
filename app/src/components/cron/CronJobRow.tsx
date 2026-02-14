import { Table, Badge, Group, Text, ActionIcon, Tooltip, Switch, Code } from '@mantine/core';
import { IconPlayerPlay, IconPencil, IconTrash, IconClock } from '@tabler/icons-react';
import type { CronJob } from '@/types';

interface CronJobRowProps {
  job: CronJob;
  instanceName: string;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export function CronJobRow({ job, instanceName, onRun, onEdit, onDelete, onToggle }: CronJobRowProps) {
  const formatSchedule = (schedule: CronJob['schedule']): string => {
    switch (schedule.kind) {
      case 'at':
        return `Una vez: ${new Date(schedule.at).toLocaleString('es-ES')}`;
      case 'every':
        const ms = schedule.everyMs;
        if (ms < 60000) return `Cada ${ms / 1000}s`;
        if (ms < 3600000) return `Cada ${ms / 60000}m`;
        if (ms < 86400000) return `Cada ${ms / 3600000}h`;
        return `Cada ${ms / 86400000}d`;
      case 'cron':
        return schedule.expr;
      default:
        return 'Desconocido';
    }
  };

  const formatPayload = (payload: CronJob['payload']): string => {
    switch (payload.kind) {
      case 'systemEvent':
        return payload.text.slice(0, 50) + (payload.text.length > 50 ? '...' : '');
      case 'agentTurn':
        return payload.message.slice(0, 50) + (payload.message.length > 50 ? '...' : '');
      default:
        return 'Desconocido';
    }
  };

  const timeSince = (date?: Date) => {
    if (!date) return '—';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `hace ${seconds}s`;
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    return `hace ${Math.floor(seconds / 86400)}d`;
  };

  const timeUntil = (date?: Date) => {
    if (!date) return '—';
    const seconds = Math.floor((date.getTime() - new Date().getTime()) / 1000);
    if (seconds < 0) return 'Pendiente';
    if (seconds < 60) return `en ${seconds}s`;
    if (seconds < 3600) return `en ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `en ${Math.floor(seconds / 3600)}h`;
    return `en ${Math.floor(seconds / 86400)}d`;
  };

  return (
    <Table.Tr style={{ opacity: job.enabled ? 1 : 0.5 }}>
      <Table.Td>
        <Group gap="xs">
          <Text size="sm" fw={500}>{job.name || job.id}</Text>
          {job.payload.kind === 'agentTurn' && (
            <Badge size="xs" variant="light" color="violet">Agent</Badge>
          )}
          {job.payload.kind === 'systemEvent' && (
            <Badge size="xs" variant="light" color="blue">System</Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">{instanceName}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <IconClock size={14} style={{ opacity: 0.6 }} />
          <Code>{formatSchedule(job.schedule)}</Code>
        </Group>
      </Table.Td>
      <Table.Td>
        <Tooltip label={formatPayload(job.payload)} multiline w={300}>
          <Text size="sm" lineClamp={1} style={{ maxWidth: 200 }}>
            {formatPayload(job.payload)}
          </Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {job.lastStatus === 'success' && <Badge size="sm" color="green">✓</Badge>}
          {job.lastStatus === 'error' && <Badge size="sm" color="red">✗</Badge>}
          <Text size="sm">{timeSince(job.lastRun)}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{timeUntil(job.nextRun)}</Text>
      </Table.Td>
      <Table.Td>
        <Switch
          size="sm"
          checked={job.enabled}
          onChange={onToggle}
          aria-label="Activar/desactivar job"
        />
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <Tooltip label="Ejecutar ahora">
            <ActionIcon variant="subtle" color="green" onClick={onRun} disabled={!job.enabled}>
              <IconPlayerPlay size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar">
            <ActionIcon variant="subtle" onClick={onEdit}>
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar">
            <ActionIcon variant="subtle" color="red" onClick={onDelete}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
