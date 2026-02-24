import { useState, useEffect } from 'react';
import { Modal, TextInput, PasswordInput, Select, Stack, Group, Button, Switch, Text, Divider, Paper, Table } from '@mantine/core';

interface CatalogEntry {
  provider: string;
  name: string;
  icon: string;
  models: { id: string; name: string; input?: number; output?: number }[];
}

interface LLMProviderModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: {
    provider: string;
    name: string;
    icon: string;
    apiKey: string;
    baseUrl?: string;
    isActive: boolean;
    models: { id: string; name: string; input: number; output: number }[];
  }) => void;
  editingProvider?: any;
  catalog: Record<string, CatalogEntry>;
}

const KEY_PLACEHOLDERS: Record<string, string> = {
  anthropic: 'sk-ant-...',
  google: 'AIza...',
  openrouter: 'sk-or-...',
  deepseek: 'sk-...',
};

export function LLMProviderModal({ opened, onClose, onSubmit, editingProvider, catalog }: LLMProviderModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const entry = selectedProvider ? catalog[selectedProvider] : null;

  useEffect(() => {
    if (editingProvider) {
      setSelectedProvider(editingProvider.provider || null);
      setApiKey('');
      setBaseUrl(editingProvider.baseUrl || '');
      setIsActive(editingProvider.isActive ?? true);
    } else {
      setSelectedProvider(null);
      setApiKey('');
      setBaseUrl('');
      setIsActive(true);
    }
  }, [editingProvider, opened]);

  const handleSubmit = () => {
    if (!selectedProvider || !entry) return;
    if (!apiKey && !editingProvider) return;

    onSubmit({
      provider: selectedProvider,
      name: entry.name,
      icon: entry.icon,
      apiKey: apiKey || '',
      baseUrl: baseUrl || undefined,
      isActive,
      models: entry.models.map(m => ({
        id: m.id,
        name: m.name,
        input: m.input || 0,
        output: m.output || 0,
      })),
    });
    onClose();
  };

  const providerOptions = Object.entries(catalog).map(([key, cat]) => ({
    value: key,
    label: `${cat.icon} ${cat.name} (${cat.models?.length || 0} modelos)`,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingProvider ? `Editar ${editingProvider.name}` : 'Añadir Proveedor LLM'}
      size="lg"
    >
      <Stack gap="md">
        <Select
          label="Proveedor"
          placeholder="Selecciona un proveedor..."
          data={providerOptions}
          value={selectedProvider}
          onChange={setSelectedProvider}
          disabled={!!editingProvider}
          searchable
          required
        />

        <PasswordInput
          label="API Key"
          placeholder={selectedProvider ? (KEY_PLACEHOLDERS[selectedProvider] || 'sk-...') : 'sk-...'}
          value={apiKey}
          onChange={(e) => setApiKey(e.currentTarget.value)}
          description={editingProvider ? 'Dejar vacío para mantener la actual' : undefined}
          required={!editingProvider}
        />

        <TextInput
          label="Base URL (opcional)"
          placeholder="https://api.example.com/v1"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.currentTarget.value)}
        />

        <Switch
          label="Proveedor activo"
          checked={isActive}
          onChange={(e) => setIsActive(e.currentTarget.checked)}
        />

        {entry && entry.models.length > 0 && (
          <>
            <Divider label={`${entry.models.length} modelos disponibles`} labelPosition="center" />
            <Paper p="sm" radius="sm" withBorder style={{ maxHeight: 300, overflow: 'auto' }}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Modelo</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Input $/1M</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Output $/1M</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {entry.models.slice(0, 50).map((m) => (
                    <Table.Tr key={m.id}>
                      <Table.Td>
                        <Text size="sm">{m.name}</Text>
                        <Text size="xs" c="dimmed">{m.id}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>${(m.input || 0).toFixed(2)}</Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>${(m.output || 0).toFixed(2)}</Table.Td>
                    </Table.Tr>
                  ))}
                  {entry.models.length > 50 && (
                    <Table.Tr>
                      <Table.Td colSpan={3}>
                        <Text size="xs" c="dimmed" ta="center">...y {entry.models.length - 50} modelos más</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!selectedProvider || (!apiKey && !editingProvider)}>
            {editingProvider ? 'Guardar' : 'Añadir'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
