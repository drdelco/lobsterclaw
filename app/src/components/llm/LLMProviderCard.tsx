import { Card, Group, Text, Badge, ActionIcon, Menu, Stack, ThemeIcon, Tooltip, Switch } from '@mantine/core';
import { IconDots, IconPencil, IconTrash, IconRefresh, IconCheck, IconX, IconPlugConnected } from '@tabler/icons-react';

interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    icon: string;
    provider: string;
    isActive: boolean;
    models: any[];
    apiKeyMasked?: string;
    testStatus?: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  onToggle: (active: boolean) => void;
}

export function LLMProviderCard({ provider, onEdit, onDelete, onTest, onToggle }: ProviderCardProps) {
  const statusColor = provider.testStatus === 'ok' ? 'green' : provider.testStatus === 'error' ? 'red' : 'gray';

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: 'pointer' }} onClick={onEdit}>
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Text size="2rem">{provider.icon || '⚪'}</Text>
          <div>
            <Text fw={600} size="lg">{provider.name}</Text>
            <Text size="xs" c="dimmed">{provider.models?.length || 0} modelos</Text>
          </div>
        </Group>
        <Group gap="xs">
          <Tooltip label={provider.isActive ? 'Desactivar' : 'Activar'}>
            <Switch
              checked={provider.isActive}
              onChange={(e) => { e.stopPropagation(); onToggle(e.currentTarget.checked); }}
              onClick={(e) => e.stopPropagation()}
              size="sm"
            />
          </Tooltip>
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPlugConnected size={14} />} onClick={(e) => { e.stopPropagation(); onTest(); }}>
                Probar conexión
              </Menu.Item>
              <Menu.Item leftSection={<IconPencil size={14} />} onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                Editar
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                Eliminar
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Stack gap="xs">
        {provider.apiKeyMasked && (
          <Text size="xs" c="dimmed" ff="monospace">{provider.apiKeyMasked}</Text>
        )}
        <Group gap={4} mt="xs">
          <ThemeIcon size="xs" radius="xl" color={statusColor} variant="light">
            {provider.testStatus === 'ok' ? <IconCheck size={10} /> :
             provider.testStatus === 'error' ? <IconX size={10} /> :
             <IconRefresh size={10} />}
          </ThemeIcon>
          <Text size="xs" c={statusColor}>
            {provider.testStatus === 'ok' ? 'Conectado' : provider.testStatus === 'error' ? 'Error' : 'Sin probar'}
          </Text>
        </Group>
        <Group gap={4} mt={4} wrap="wrap">
          {(Array.isArray(provider.models) ? provider.models : []).slice(0, 4).map((m: any, i: number) => (
            <Badge key={typeof m === 'string' ? m : m?.id || m?.name || i} variant="light" size="xs">
              {typeof m === 'string' ? m : m?.name || m?.id || '?'}
            </Badge>
          ))}
          {Array.isArray(provider.models) && provider.models.length > 4 && (
            <Badge variant="outline" size="xs" c="dimmed">+{provider.models.length - 4}</Badge>
          )}
        </Group>
      </Stack>
    </Card>
  );
}
