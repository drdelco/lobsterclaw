import { Card, Group, Text, Badge, Stack, Button, Box, Tooltip, Progress, Divider } from '@mantine/core';
import { IconRefresh, IconActivity, IconCpu, IconClock, IconServer, IconDownload } from '@tabler/icons-react';
import type { Instance } from '@/types';

interface InstanceCardProps {
  instance: Instance;
  isSelected: boolean;
  onSelect: () => void;
  onRestart: () => void;
  onUpdate?: () => void;
}

export function InstanceCard({ instance, isSelected, onSelect, onRestart, onUpdate }: InstanceCardProps) {
  const statusColors: Record<string, string> = {
    online: 'green',
    offline: 'gray',
    error: 'red',
    unknown: 'yellow',
  };

  const statusLabels: Record<string, string> = {
    online: 'Online',
    offline: 'Offline',
    error: 'Error',
    unknown: 'Desconocido',
  };

  const locationLabels: Record<string, string> = {
    gcloud: 'Google Cloud',
    local: 'Local',
    vps: 'VPS',
  };

  const formatUptime = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const timeSince = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
    if (seconds < 60) return `hace ${seconds}s`;
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    return `hace ${Math.floor(seconds / 86400)}d`;
  };

  const memColor = (pct: number) => pct > 85 ? 'red' : pct > 70 ? 'yellow' : 'green';
  const diskColor = (pct: number) => pct > 90 ? 'red' : pct > 75 ? 'yellow' : 'green';

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
        borderWidth: isSelected ? 2 : 1,
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Text size="1.75rem">{instance.emoji || '🤖'}</Text>
          <Box>
            <Text fw={600} size="lg">{instance.name}</Text>
            <Group gap={4}>
              <Text size="xs" c="dimmed">{locationLabels[instance.location] || instance.location}</Text>
              {instance.region && (
                <Text size="xs" c="dimmed">· {instance.region}</Text>
              )}
            </Group>
          </Box>
        </Group>
        <Badge color={statusColors[instance.status]} variant="dot" size="lg">
          {statusLabels[instance.status]}
        </Badge>
      </Group>

      {/* Core info */}
      <Stack gap="xs">
        <Group gap="xs">
          <IconActivity size={16} style={{ opacity: 0.6 }} />
          <Text size="sm" c="dimmed">Versión:</Text>
          <Badge size="sm" variant="light">{instance.version}</Badge>
        </Group>

        <Group gap="xs">
          <IconCpu size={16} style={{ opacity: 0.6 }} />
          <Text size="sm" c="dimmed">Modelo:</Text>
          <Tooltip label={instance.model}>
            <Badge size="sm" variant="light" color="blue">
              {instance.model?.split('/').pop() || 'unknown'}
            </Badge>
          </Tooltip>
        </Group>

        {instance.fallbacks && instance.fallbacks.length > 0 && (
          <Group gap="xs" ml={20}>
            <Text size="xs" c="dimmed">Fallbacks:</Text>
            {instance.fallbacks.map((fb: string) => (
              <Badge key={fb} size="xs" variant="outline" color="gray">
                {fb.split('/').pop()}
              </Badge>
            ))}
          </Group>
        )}

        <Group gap="xs">
          <IconClock size={16} style={{ opacity: 0.6 }} />
          <Text size="sm" c="dimmed">Uptime:</Text>
          <Text size="sm">{formatUptime(instance.uptimeSeconds || 0)}</Text>
        </Group>

        <Group gap="xs">
          <IconServer size={16} style={{ opacity: 0.6 }} />
          <Text size="sm" c="dimmed">Heartbeat:</Text>
          <Text size="sm">{instance.lastHeartbeat ? timeSince(instance.lastHeartbeat) : 'N/A'}</Text>
        </Group>
      </Stack>

      {/* System resources */}
      {(instance.memoryUsedPct !== undefined || instance.diskUsedPct !== undefined) && (
        <>
          <Divider my="sm" />
          <Stack gap={6}>
            {instance.memoryUsedPct !== undefined && (
              <Box>
                <Group justify="space-between" mb={2}>
                  <Text size="xs" c="dimmed">Memoria</Text>
                  <Text size="xs" c="dimmed">
                    {instance.memoryUsedPct}%
                    {instance.memoryTotalGB ? ` de ${instance.memoryTotalGB}GB` : ''}
                  </Text>
                </Group>
                <Progress value={instance.memoryUsedPct} color={memColor(instance.memoryUsedPct)} size="sm" radius="xl" />
              </Box>
            )}
            
            {instance.diskUsedPct !== undefined && (
              <Box>
                <Group justify="space-between" mb={2}>
                  <Text size="xs" c="dimmed">Disco</Text>
                  <Text size="xs" c="dimmed">
                    {instance.diskUsedPct}%
                    {instance.diskTotalGB ? ` de ${instance.diskTotalGB}GB` : ''}
                  </Text>
                </Group>
                <Progress value={instance.diskUsedPct} color={diskColor(instance.diskUsedPct)} size="sm" radius="xl" />
              </Box>
            )}
            
            {instance.loadAvg1m !== undefined && (
              <Group gap="xs">
                <Text size="xs" c="dimmed">CPU Load:</Text>
                <Text size="xs">{instance.loadAvg1m} ({instance.cpus || '?'} cores)</Text>
              </Group>
            )}
          </Stack>
        </>
      )}

      {/* Actions */}
      <Group justify="flex-end" mt="md">
        {onUpdate && (
          <Button
            variant="subtle"
            size="xs"
            color="blue"
            leftSection={<IconDownload size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate();
            }}
          >
            Actualizar
          </Button>
        )}
        <Button
          variant="subtle"
          size="xs"
          color="red"
          leftSection={<IconRefresh size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            onRestart();
          }}
        >
          Restart
        </Button>
      </Group>
    </Card>
  );
}
