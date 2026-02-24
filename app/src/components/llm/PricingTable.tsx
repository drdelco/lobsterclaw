import { Table, Paper, Title, Text, Badge, Group, Box } from '@mantine/core';
import { getAllTemplateModels } from './providerTemplates';

export function PricingTable() {
  const models = (getAllTemplateModels() || []).sort((a, b) => (a.input || 0) - (b.input || 0));

  return (
    <Paper p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Box>
          <Title order={4}>💰 Tabla de Precios</Title>
          <Text size="sm" c="dimmed">Todos los modelos ordenados por coste ($/1M tokens)</Text>
        </Box>
        <Badge variant="light" color="gray">{models.length} modelos</Badge>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Proveedor</Table.Th>
            <Table.Th>Modelo</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Input $/1M</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Output $/1M</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Promedio</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {models.map((m, i) => {
            const avg = (m.input + m.output) / 2;
            const tier = avg === 0 ? 'green' : avg < 0.5 ? 'teal' : avg < 3 ? 'yellow' : avg < 15 ? 'orange' : 'red';
            return (
              <Table.Tr key={`${m.providerId}-${m.modelId}-${i}`}>
                <Table.Td>
                  <Group gap={6}>
                    <Text size="sm">{m.icon}</Text>
                    <Text size="sm">{m.providerName}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>{m.modelName}</Text>
                  <Text size="xs" c="dimmed">{m.modelId}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="sm">${m.input.toFixed(2)}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="sm">${m.output.toFixed(2)}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Badge size="sm" variant="light" color={tier}>
                    ${avg.toFixed(2)}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
