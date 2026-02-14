import { Box, Title, Text, SimpleGrid, Paper, Group, Select, Badge, SegmentedControl, NumberInput, Button } from '@mantine/core';
import { AreaChart, DonutChart } from '@mantine/charts';
import { IconCurrencyDollar, IconReceipt, IconChartPie, IconCalendar, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { CostCard } from '@/components/costs/CostCard';
import { CostsByInstance } from '@/components/costs/CostsByInstance';
import type { Instance, MonthlyCost } from '@/types';

// Mock data
const mockInstances: Instance[] = [
  {
    id: 'alvi',
    name: 'Alvi',
    emoji: '🦉',
    location: 'gcloud',
    host: 'localhost',
    port: 3033,
    gatewayToken: '***',
    status: 'online',
    lastHeartbeat: new Date(),
    version: '2026.2.3-1',
    model: 'anthropic/claude-opus-4-5',
    createdAt: new Date('2026-02-08'),
  },
];

const mockCosts: Record<string, MonthlyCost> = {
  alvi: {
    instanceId: 'alvi',
    month: '2026-02',
    total: 47.32,
    budget: 100,
    byProvider: {
      anthropic: 38.50,
      google: 8.82,
    },
    byModel: {
      'anthropic/claude-opus-4-5': 35.20,
      'anthropic/claude-sonnet-4': 3.30,
      'google/gemini-2.5-pro': 8.82,
    },
    tokensByModel: {
      'anthropic/claude-opus-4-5': { input: 125000, output: 45000 },
      'anthropic/claude-sonnet-4': { input: 35000, output: 12000 },
      'google/gemini-2.5-pro': { input: 89000, output: 32000 },
    },
    dailyCosts: [
      { date: '2026-02-01', total: 2.10, byModel: {} },
      { date: '2026-02-02', total: 1.85, byModel: {} },
      { date: '2026-02-03', total: 3.20, byModel: {} },
      { date: '2026-02-04', total: 2.45, byModel: {} },
      { date: '2026-02-05', total: 4.10, byModel: {} },
      { date: '2026-02-06', total: 3.75, byModel: {} },
      { date: '2026-02-07', total: 2.90, byModel: {} },
      { date: '2026-02-08', total: 5.20, byModel: {} },
      { date: '2026-02-09', total: 3.85, byModel: {} },
      { date: '2026-02-10', total: 4.50, byModel: {} },
      { date: '2026-02-11', total: 3.15, byModel: {} },
      { date: '2026-02-12', total: 4.80, byModel: {} },
      { date: '2026-02-13', total: 3.27, byModel: {} },
      { date: '2026-02-14', total: 2.20, byModel: {} },
    ],
  },
};

export function CostsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');
  const [budget, setBudget] = useState(100);

  const instances = mockInstances;
  const costs = mockCosts;
  
  const totalCost = Object.values(costs).reduce((sum, c) => sum + c.total, 0);
  const budgetUsage = (totalCost / budget) * 100;
  
  // Aggregate by provider
  const byProvider = Object.values(costs).reduce((acc, c) => {
    Object.entries(c.byProvider).forEach(([provider, amount]) => {
      acc[provider] = (acc[provider] || 0) + amount;
    });
    return acc;
  }, {} as Record<string, number>);

  // Aggregate by model
  const byModel = Object.values(costs).reduce((acc, c) => {
    Object.entries(c.byModel).forEach(([model, amount]) => {
      acc[model] = (acc[model] || 0) + amount;
    });
    return acc;
  }, {} as Record<string, number>);

  // Chart data
  const dailyData = costs.alvi?.dailyCosts.map((d) => ({
    date: d.date.slice(5), // MM-DD
    Coste: d.total,
  })) || [];

  const providerChartData = Object.entries(byProvider).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: name === 'anthropic' ? 'orange.6' : name === 'google' ? 'blue.6' : 'gray.6',
  }));

  const modelChartData = Object.entries(byModel).map(([name, value]) => ({
    name: name.split('/').pop() || name,
    value,
    color: name.includes('opus') ? 'orange.6' : name.includes('sonnet') ? 'yellow.6' : 'blue.6',
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const daysInMonth = 28; // Feb
  const daysElapsed = 14;
  const projectedTotal = (totalCost / daysElapsed) * daysInMonth;

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Group gap="sm">
            <Title order={2}>Control de Costes</Title>
            {budgetUsage > 80 && (
              <Badge color="red" leftSection={<IconAlertTriangle size={12} />}>
                {budgetUsage.toFixed(0)}% del presupuesto
              </Badge>
            )}
          </Group>
          <Text c="dimmed" mt={4}>
            Monitoriza el gasto en tokens de tus instancias
          </Text>
        </Box>
        <Group>
          <Select
            value={selectedMonth}
            onChange={(v) => setSelectedMonth(v || '2026-02')}
            data={[
              { value: '2026-02', label: 'Febrero 2026' },
              { value: '2026-01', label: 'Enero 2026' },
            ]}
            leftSection={<IconCalendar size={16} />}
            w={180}
          />
          <SegmentedControl
            value={viewMode}
            onChange={(v) => setViewMode(v as 'overview' | 'details')}
            data={[
              { label: 'Resumen', value: 'overview' },
              { label: 'Detalle', value: 'details' },
            ]}
          />
        </Group>
      </Group>

      {/* Summary Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <CostCard
          title="Gasto este mes"
          value={formatCurrency(totalCost)}
          subtitle={`de ${formatCurrency(budget)} presupuesto`}
          icon={<IconCurrencyDollar size={20} />}
          color="blue"
          progress={budgetUsage}
        />
        <CostCard
          title="Proyección mensual"
          value={formatCurrency(projectedTotal)}
          subtitle={projectedTotal > budget ? '⚠️ Superará el presupuesto' : 'Dentro del presupuesto'}
          icon={<IconChartPie size={20} />}
          color={projectedTotal > budget ? 'red' : 'green'}
        />
        <CostCard
          title="Gasto diario medio"
          value={formatCurrency(totalCost / daysElapsed)}
          subtitle={`${daysElapsed} días transcurridos`}
          icon={<IconReceipt size={20} />}
          color="violet"
          trend={{ value: 12, label: 'vs semana anterior' }}
        />
        <Paper p="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed" fw={500} mb="xs">Presupuesto mensual</Text>
          <Group>
            <NumberInput
              value={budget}
              onChange={(v) => setBudget(Number(v) || 100)}
              prefix="$"
              min={10}
              max={1000}
              step={10}
              style={{ flex: 1 }}
            />
            <Button variant="light" size="sm">Guardar</Button>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Charts Row */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="xl">
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Gasto diario</Text>
          <AreaChart
            h={250}
            data={dailyData}
            dataKey="date"
            series={[{ name: 'Coste', color: 'blue.6' }]}
            curveType="natural"
            withDots={false}
            gridAxis="xy"
            valueFormatter={(value) => `$${value.toFixed(2)}`}
          />
        </Paper>

        <SimpleGrid cols={2}>
          <Paper p="lg" radius="md" withBorder>
            <Text fw={600} mb="md">Por proveedor</Text>
            <DonutChart
              h={200}
              data={providerChartData}
              withLabelsLine
              withLabels
              tooltipDataSource="segment"
              valueFormatter={(value) => `$${value.toFixed(2)}`}
            />
          </Paper>
          <Paper p="lg" radius="md" withBorder>
            <Text fw={600} mb="md">Por modelo</Text>
            <DonutChart
              h={200}
              data={modelChartData}
              withLabelsLine
              withLabels
              tooltipDataSource="segment"
              valueFormatter={(value) => `$${value.toFixed(2)}`}
            />
          </Paper>
        </SimpleGrid>
      </SimpleGrid>

      {/* By Instance Table */}
      <Paper radius="md" withBorder>
        <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
          <Text fw={600}>Desglose por instancia</Text>
          <Badge variant="light">{instances.length} instancias</Badge>
        </Group>
        <CostsByInstance 
          instances={instances} 
          costs={costs} 
          totalBudget={budget}
        />
      </Paper>
    </Box>
  );
}
