import { useState } from 'react';
import { Box, Title, Text, Button, SimpleGrid, Paper, Group, Table, Badge, Stack, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconRobot, IconList } from '@tabler/icons-react';
import { LLMProviderCard } from '@/components/llm/LLMProviderCard';
import { LLMProviderModal } from '@/components/llm/LLMProviderModal';
import type { LLMProvider } from '@/types';

// Mock data
const mockProviders: LLMProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    apiKey: 'sk-ant-xxxxxxxxxxxxxxxxxxxx',
    isActive: true,
    testStatus: 'ok',
    lastTested: new Date(Date.now() - 86400000),
    models: [
      { id: 'claude-opus-4-5', name: 'claude-opus-4-5', alias: 'opus', inputCostPer1k: 0.015, outputCostPer1k: 0.075, maxTokens: 200000 },
      { id: 'claude-sonnet-4', name: 'claude-sonnet-4', alias: 'sonnet', inputCostPer1k: 0.003, outputCostPer1k: 0.015, maxTokens: 200000 },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXX',
    isActive: true,
    testStatus: 'ok',
    lastTested: new Date(Date.now() - 172800000),
    models: [
      { id: 'gemini-2.5-pro', name: 'gemini-2.5-pro', inputCostPer1k: 0.00125, outputCostPer1k: 0.005, maxTokens: 1000000 },
      { id: 'gemini-2.5-flash', name: 'gemini-2.5-flash', inputCostPer1k: 0.000075, outputCostPer1k: 0.0003, maxTokens: 1000000 },
    ],
  },
  {
    id: 'zhipu',
    name: 'Zhipu',
    apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxx',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    isActive: false,
    testStatus: 'unknown',
    models: [
      { id: 'glm-5', name: 'glm-5', inputCostPer1k: 0.002, outputCostPer1k: 0.006, maxTokens: 128000 },
    ],
  },
];

export function LLMsPage() {
  const [providers, setProviders] = useState<LLMProvider[]>(mockProviders);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingProvider, setEditingProvider] = useState<LLMProvider | undefined>();
  const [activeTab, setActiveTab] = useState<string | null>('providers');

  const handleAddProvider = () => {
    setEditingProvider(undefined);
    openModal();
  };

  const handleEditProvider = (provider: LLMProvider) => {
    setEditingProvider(provider);
    openModal();
  };

  const handleSubmitProvider = (providerData: Partial<LLMProvider>) => {
    if (editingProvider) {
      setProviders(providers.map((p) => 
        p.id === editingProvider.id ? { ...p, ...providerData } : p
      ));
      notifications.show({
        title: 'Proveedor actualizado',
        message: `${providerData.name} ha sido actualizado`,
        color: 'blue',
      });
    } else {
      const newProvider: LLMProvider = {
        id: `provider-${Date.now()}`,
        name: providerData.name!,
        apiKey: providerData.apiKey!,
        baseUrl: providerData.baseUrl,
        isActive: providerData.isActive ?? true,
        testStatus: 'unknown',
        models: providerData.models || [],
      };
      setProviders([...providers, newProvider]);
      notifications.show({
        title: 'Proveedor añadido',
        message: `${providerData.name} ha sido configurado`,
        color: 'green',
      });
    }
  };

  const handleDeleteProvider = (provider: LLMProvider) => {
    modals.openConfirmModal({
      title: 'Eliminar proveedor',
      children: (
        <Text size="sm">
          ¿Estás seguro de que quieres eliminar {provider.name}? Las instancias que usen sus modelos dejarán de funcionar.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setProviders(providers.filter((p) => p.id !== provider.id));
        notifications.show({
          title: 'Proveedor eliminado',
          message: `${provider.name} ha sido eliminado`,
          color: 'red',
        });
      },
    });
  };

  const handleTestProvider = (provider: LLMProvider) => {
    notifications.show({
      title: 'Probando conexión',
      message: `Verificando ${provider.name}...`,
      loading: true,
      autoClose: 2000,
    });

    // Simulate test
    setTimeout(() => {
      setProviders(providers.map((p) => 
        p.id === provider.id ? { ...p, testStatus: 'ok' as const, lastTested: new Date() } : p
      ));
      notifications.show({
        title: 'Conexión exitosa',
        message: `${provider.name} está funcionando correctamente`,
        color: 'green',
      });
    }, 1500);
  };

  const handleToggleProvider = (provider: LLMProvider) => {
    setProviders(providers.map((p) => 
      p.id === provider.id ? { ...p, isActive: !p.isActive } : p
    ));
    notifications.show({
      message: provider.isActive ? `${provider.name} desactivado` : `${provider.name} activado`,
      color: provider.isActive ? 'yellow' : 'green',
    });
  };

  // All models from all providers
  const allModels = providers.flatMap((p) => 
    p.models.map((m) => ({ ...m, providerName: p.name, providerActive: p.isActive }))
  );

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(6)}`;
  };

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2}>Gestión de LLMs</Title>
          <Text c="dimmed" mt={4}>
            Configura los proveedores y modelos disponibles
          </Text>
        </Box>
        <Button leftSection={<IconPlus size={18} />} onClick={handleAddProvider}>
          Añadir Proveedor
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="providers" leftSection={<IconRobot size={16} />}>
            Proveedores ({providers.length})
          </Tabs.Tab>
          <Tabs.Tab value="models" leftSection={<IconList size={16} />}>
            Todos los modelos ({allModels.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="providers">
          {providers.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {providers.map((provider) => (
                <LLMProviderCard
                  key={provider.id}
                  provider={provider}
                  onEdit={() => handleEditProvider(provider)}
                  onDelete={() => handleDeleteProvider(provider)}
                  onTest={() => handleTestProvider(provider)}
                  onToggle={() => handleToggleProvider(provider)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Paper p="xl" radius="md" withBorder>
              <Stack align="center" gap="md" py="xl">
                <IconRobot size={48} style={{ opacity: 0.5 }} />
                <Text c="dimmed">No hay proveedores configurados</Text>
                <Button leftSection={<IconPlus size={18} />} onClick={handleAddProvider}>
                  Añadir tu primer proveedor
                </Button>
              </Stack>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="models">
          <Paper radius="md" withBorder>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Modelo</Table.Th>
                  <Table.Th>Alias</Table.Th>
                  <Table.Th>Proveedor</Table.Th>
                  <Table.Th>Coste Input</Table.Th>
                  <Table.Th>Coste Output</Table.Th>
                  <Table.Th>Max Tokens</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {allModels.map((model) => (
                  <Table.Tr key={`${model.providerName}-${model.id}`} style={{ opacity: model.providerActive ? 1 : 0.5 }}>
                    <Table.Td>
                      <Text fw={500}>{model.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      {model.alias && <Badge variant="light" size="sm">{model.alias}</Badge>}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{model.providerName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" ff="monospace">{formatCost(model.inputCostPer1k)}/1K</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" ff="monospace">{formatCost(model.outputCostPer1k)}/1K</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{(model.maxTokens / 1000).toFixed(0)}K</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={model.providerActive ? 'green' : 'gray'} variant="dot">
                        {model.providerActive ? 'Disponible' : 'Inactivo'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      <LLMProviderModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={handleSubmitProvider}
        editingProvider={editingProvider}
      />
    </Box>
  );
}
