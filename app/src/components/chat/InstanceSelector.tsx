import { NavLink, Stack, Text, Badge, Group, Box, ScrollArea } from '@mantine/core';
import { IconCircleFilled } from '@tabler/icons-react';
import type { Instance } from '@/types';

interface InstanceSelectorProps {
  instances: Instance[];
  selectedId: string | null;
  onSelect: (instanceId: string) => void;
  unreadCounts?: Record<string, number>;
}

export function InstanceSelector({ instances, selectedId, onSelect, unreadCounts = {} }: InstanceSelectorProps) {
  const statusColors: Record<string, string> = {
    online: 'green',
    offline: 'gray',
    error: 'red',
  };

  return (
    <Box
      w={220}
      h="100%"
      style={{
        borderRight: '1px solid var(--mantine-color-dark-6)',
        backgroundColor: 'var(--mantine-color-dark-8)',
      }}
    >
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
        <Text fw={600} size="sm">Instancias</Text>
      </Box>
      
      <ScrollArea h="calc(100% - 52px)" p="xs">
        <Stack gap={4}>
          {instances.map((instance) => (
            <NavLink
              key={instance.id}
              label={
                <Group justify="space-between" wrap="nowrap">
                  <Text size="sm" lineClamp={1}>{instance.name}</Text>
                  {unreadCounts[instance.id] > 0 && (
                    <Badge size="xs" circle color="blue">
                      {unreadCounts[instance.id]}
                    </Badge>
                  )}
                </Group>
              }
              description={
                <Group gap={4}>
                  <IconCircleFilled 
                    size={8} 
                    style={{ color: `var(--mantine-color-${statusColors[instance.status]}-6)` }} 
                  />
                  <Text size="xs" c="dimmed">
                    {instance.status === 'online' ? 'Online' : instance.status}
                  </Text>
                </Group>
              }
              leftSection={<Text size="lg">{instance.emoji || '🤖'}</Text>}
              active={selectedId === instance.id}
              onClick={() => onSelect(instance.id)}
              variant="filled"
              styles={{
                root: {
                  borderRadius: 'var(--mantine-radius-md)',
                },
              }}
            />
          ))}
          
          {instances.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No hay instancias
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Box>
  );
}
