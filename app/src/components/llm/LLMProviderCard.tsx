import { Card, Group, Text, Badge, ActionIcon, Menu, Stack, ThemeIcon, Code } from '@mantine/core';
import { IconDots, IconPencil, IconTrash, IconRefresh, IconCheck, IconX, IconKey } from '@tabler/icons-react';
import type { LLMProvider } from '@/types';

interface LLMProviderCardProps {
  provider: LLMProvider;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  onToggle: () => void;
}

export function LLMProviderCard({ provider, onEdit, onDelete, onTest, onToggle }: LLMProviderCardProps) {
  const statusColors: Record<string, string> = {
    ok: 'green',
    error: 'red',
    unknown: 'gray',
  };

  const statusLabels: Record<string, string> = {
    ok: 'Conectado',
    error: 'Error',
    unknown: 'Sin probar',
  };

  const providerLogos: Record<string, string> = {
    anthropic: '🅰️',
    google: '🔷',
    openai: '🟢',
    zhipu: '🔵',
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••' + key.slice(-4);
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Text size="xl">{providerLogos[provider.name.toLowerCase()] || '🤖'}</Text>
          <div>
            <Text fw={600}>{provider.name}</Text>
            <Text size="xs" c="dimmed">{provider.models.length} modelos</Text>
          </div>
        </Group>
        <Group gap="xs">
          <Badge 
            color={provider.isActive ? 'green' : 'gray'} 
            variant="dot"
            style={{ cursor: 'pointer' }}
            onClick={onToggle}
          >
            {provider.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconRefresh size={14} />} onClick={onTest}>
                Probar conexión
              </Menu.Item>
              <Menu.Item leftSection={<IconPencil size={14} />} onClick={onEdit}>
                Editar
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={onDelete}>
                Eliminar
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Stack gap="xs">
        <Group gap="xs">
          <IconKey size={14} style={{ opacity: 0.6 }} />
          <Text size="sm" c="dimmed">API Key:</Text>
          <Code>{maskApiKey(provider.apiKey)}</Code>
        </Group>

        {provider.baseUrl && (
          <Group gap="xs">
            <Text size="sm" c="dimmed">URL:</Text>
            <Text size="sm">{provider.baseUrl}</Text>
          </Group>
        )}

        <Group gap="xs" mt="xs">
          <ThemeIcon 
            size="sm" 
            radius="xl" 
            color={statusColors[provider.testStatus]}
            variant="light"
          >
            {provider.testStatus === 'ok' ? (
              <IconCheck size={12} />
            ) : provider.testStatus === 'error' ? (
              <IconX size={12} />
            ) : (
              <IconRefresh size={12} />
            )}
          </ThemeIcon>
          <Text size="sm" c={statusColors[provider.testStatus]}>
            {statusLabels[provider.testStatus]}
          </Text>
          {provider.lastTested && (
            <Text size="xs" c="dimmed">
              • Probado {new Date(provider.lastTested).toLocaleDateString('es-ES')}
            </Text>
          )}
        </Group>
      </Stack>

      {/* Models list */}
      <Group gap={4} mt="md">
        {provider.models.slice(0, 3).map((model) => (
          <Badge key={model.id} variant="light" size="sm">
            {model.alias || model.name}
          </Badge>
        ))}
        {provider.models.length > 3 && (
          <Badge variant="outline" size="sm" c="dimmed">
            +{provider.models.length - 3} más
          </Badge>
        )}
      </Group>
    </Card>
  );
}
