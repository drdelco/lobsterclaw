import { Table, Text, Group, Progress, Badge } from '@mantine/core';
import type { Instance, MonthlyCost } from '@/types';

interface CostsByInstanceProps {
  instances: Instance[];
  costs: Record<string, MonthlyCost>;
  totalBudget: number;
}

export function CostsByInstance({ instances, costs, totalBudget }: CostsByInstanceProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getTopModel = (cost: MonthlyCost) => {
    const entries = Object.entries(cost.byModel);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  };

  return (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Instancia</Table.Th>
          <Table.Th>Coste este mes</Table.Th>
          <Table.Th>Modelo principal</Table.Th>
          <Table.Th>Tokens (in/out)</Table.Th>
          <Table.Th>% del total</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {instances.map((instance) => {
          const cost = costs[instance.id];
          if (!cost) return null;
          
          const topModel = getTopModel(cost);
          const percentage = (cost.total / totalBudget) * 100;
          const totalTokens = Object.values(cost.tokensByModel).reduce(
            (acc, t) => ({ input: acc.input + t.input, output: acc.output + t.output }),
            { input: 0, output: 0 }
          );

          return (
            <Table.Tr key={instance.id}>
              <Table.Td>
                <Group gap="sm">
                  <Text size="lg">{instance.emoji || '🤖'}</Text>
                  <Text fw={500}>{instance.name}</Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text fw={600}>{formatCurrency(cost.total)}</Text>
              </Table.Td>
              <Table.Td>
                {topModel && (
                  <Group gap="xs">
                    <Badge variant="light" size="sm">
                      {topModel[0].split('/').pop()}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {formatCurrency(topModel[1])}
                    </Text>
                  </Group>
                )}
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {(totalTokens.input / 1000).toFixed(1)}K / {(totalTokens.output / 1000).toFixed(1)}K
                </Text>
              </Table.Td>
              <Table.Td style={{ width: 150 }}>
                <Group gap="xs">
                  <Progress 
                    value={percentage} 
                    size="sm" 
                    style={{ flex: 1 }}
                    color={percentage > 50 ? 'orange' : 'blue'}
                  />
                  <Text size="sm" c="dimmed" w={40}>
                    {percentage.toFixed(0)}%
                  </Text>
                </Group>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
