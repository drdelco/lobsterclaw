import { Modal, TextInput, PasswordInput, Select, Stack, Group, Button, Switch, Text, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { LLMProvider, LLMModel } from '@/types';

interface LLMProviderModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (provider: Partial<LLMProvider>) => void;
  editingProvider?: LLMProvider;
}

// Predefined provider templates
const providerTemplates: Record<string, { baseUrl?: string; models: Partial<LLMModel>[] }> = {
  Anthropic: {
    models: [
      { id: 'claude-opus-4-5', name: 'claude-opus-4-5', alias: 'opus', inputCostPer1k: 0.015, outputCostPer1k: 0.075 },
      { id: 'claude-sonnet-4', name: 'claude-sonnet-4', alias: 'sonnet', inputCostPer1k: 0.003, outputCostPer1k: 0.015 },
    ],
  },
  Google: {
    models: [
      { id: 'gemini-2.5-pro', name: 'gemini-2.5-pro', inputCostPer1k: 0.00125, outputCostPer1k: 0.005 },
      { id: 'gemini-2.5-flash', name: 'gemini-2.5-flash', inputCostPer1k: 0.000075, outputCostPer1k: 0.0003 },
    ],
  },
  OpenAI: {
    models: [
      { id: 'gpt-4o', name: 'gpt-4o', inputCostPer1k: 0.005, outputCostPer1k: 0.015 },
      { id: 'gpt-4o-mini', name: 'gpt-4o-mini', inputCostPer1k: 0.00015, outputCostPer1k: 0.0006 },
    ],
  },
  Zhipu: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-5', name: 'glm-5', inputCostPer1k: 0.002, outputCostPer1k: 0.006 },
    ],
  },
  Custom: {
    models: [],
  },
};

export function LLMProviderModal({ opened, onClose, onSubmit, editingProvider }: LLMProviderModalProps) {
  const form = useForm({
    initialValues: {
      name: editingProvider?.name || '',
      apiKey: editingProvider?.apiKey || '',
      baseUrl: editingProvider?.baseUrl || '',
      isActive: editingProvider?.isActive ?? true,
    },
    validate: {
      name: (value) => (!value ? 'Nombre requerido' : null),
      apiKey: (value) => (!value ? 'API Key requerida' : null),
    },
  });

  const handleProviderSelect = (name: string) => {
    form.setFieldValue('name', name);
    const template = providerTemplates[name];
    if (template?.baseUrl) {
      form.setFieldValue('baseUrl', template.baseUrl);
    } else {
      form.setFieldValue('baseUrl', '');
    }
  };

  const handleSubmit = form.onSubmit((values) => {
    const template = providerTemplates[values.name] || providerTemplates.Custom;
    
    onSubmit({
      id: editingProvider?.id,
      name: values.name,
      apiKey: values.apiKey,
      baseUrl: values.baseUrl || undefined,
      isActive: values.isActive,
      models: template.models.map((m) => ({
        id: m.id!,
        name: m.name!,
        alias: m.alias,
        inputCostPer1k: m.inputCostPer1k || 0,
        outputCostPer1k: m.outputCostPer1k || 0,
        maxTokens: m.maxTokens || 128000,
      })),
      testStatus: 'unknown',
    });
    onClose();
    form.reset();
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingProvider ? 'Editar Proveedor LLM' : 'Añadir Proveedor LLM'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {!editingProvider && (
            <Select
              label="Proveedor"
              placeholder="Selecciona un proveedor"
              data={Object.keys(providerTemplates)}
              value={form.values.name}
              onChange={(v) => handleProviderSelect(v || '')}
              required
            />
          )}

          {editingProvider && (
            <TextInput
              label="Nombre"
              value={form.values.name}
              disabled
            />
          )}

          <PasswordInput
            label="API Key"
            placeholder="sk-..."
            required
            {...form.getInputProps('apiKey')}
          />

          <TextInput
            label="Base URL (opcional)"
            placeholder="https://api.example.com/v1"
            description="Dejar vacío para usar la URL por defecto del proveedor"
            {...form.getInputProps('baseUrl')}
          />

          <Switch
            label="Proveedor activo"
            description="Los proveedores inactivos no se usarán para completions"
            checked={form.values.isActive}
            onChange={(e) => form.setFieldValue('isActive', e.target.checked)}
          />

          {form.values.name && providerTemplates[form.values.name] && (
            <>
              <Divider label="Modelos incluidos" labelPosition="center" />
              <Text size="sm" c="dimmed">
                {providerTemplates[form.values.name].models.length > 0 ? (
                  providerTemplates[form.values.name].models.map((m) => m.name).join(', ')
                ) : (
                  'Configura los modelos después de crear el proveedor'
                )}
              </Text>
            </>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{editingProvider ? 'Guardar' : 'Añadir'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
