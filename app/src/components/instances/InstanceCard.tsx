import { Card, Group, Text, Badge, Stack, Button, Box, Tooltip } from '@mantine/core';
import { IconRefresh, IconActivity, IconCpu, IconClock } from '@tabler/icons-react';
import type { Instance } from '@/types';

interface InstanceCardProps {
  instance: Instance;
  isSelected: boolean;
  onSelect: () => void;
  onRestart: () => void;
}

export function InstanceCard({ instance, isSelected, onSelect, onRestart }: InstanceCardProps) {
  const statusColors: Record<string, string> = {
    online: 'green',
    offline: 'gray',
    error: 'red',
  };

  const statusLabels: Record<string, string> = {
    online: 'Online',
    offline: 'Offline',
    error: 'Error',
  };

  const locationLabels: Record<string, string> = {
    gcloud: 'Google Cloud',
    local: 'Local',
    vps: 'VPS',
  };

  const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `hace ${seconds}s`;
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    return `hace ${Math.floor(seconds / 86400)}d`;
  };

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
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Text size="1.75rem">{instance.emoji || '🤖'}</Text>
          <Box>
            <Text fw={600} size="lg">{instance.name}</Text>
            <Text size="sm" c="dimmed">{locationLabels[instance.location]}</Text>
          </Box>
        </Group>
        <Badge color={statusColors[instance.status]} variant="dot" size="lg">
          {statusLabels[instance.status]}
        </Badge>
      </Group>

      <Stack gap="xs">
        <Group gap="xs">
          <IconActivity size={16} style={{ opacity: 0.6 }} />
          <Text size="sm" c="dimmed">Versión:</Text>
          <Text size="sm">{instance.version}</Text>
        </Group>

        <Group gap="xs">
          <IconCpu size={16} style={{ opacity: 0.6 }} />
          <Text size="sm" c="dimmed">Modelo:</Text>
          <Tooltip label={instance.model}>
            <Text size="sm" lineClamp={1} style={{ maxWidth: 150 }}>
              {instance.model.split('/').pop()}
            </Text>
          </Tooltip>
        </Group>

        <Group gap="xs">
          <IconClock size={16} style={{ opacity: 0.6 }} />
          <Text size="sm" c="dimmed">Heartbeat:</Text>
          <Text size="sm">{timeSince(instance.lastHeartbeat)}</Text>
        </Group>
      </Stack>

      <Group justify="flex-end" mt="md">
        <Button
          variant="subtle"
          size="xs"
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
