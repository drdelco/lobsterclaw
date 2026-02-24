import { Box, Title, Text, SimpleGrid, Paper, Group, Select, Badge, SegmentedControl, NumberInput, Button, Loader, Center, Alert } from '@mantine/core';
import { AreaChart, DonutChart } from '@mantine/charts';
import { IconCurrencyDollar, IconReceipt, IconChartPie, IconCalendar, IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import { CostCard } from '@/components/costs/CostCard';
import { CostsByInstance } from '@/components/costs/CostsByInstance';
import { useInstances, useMonthlyCosts, useCostsSummary } from '@/hooks/useFirestore';
import type { Instance, MonthlyCost } from '@/types';

// Fallback mock data (used when not authenticated or no data)
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
    total: 0,
    budget: 100,
    byProvider: {},
    byModel: {},
    tokensByModel: {},
    dailyCosts: [],
  },
};

export function CostsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');
  const [budget, setBudget] = useState(100);

  // Firestore data
  const { instances: firestoreInstances, loading: loadingInstances, error: instancesError } = useInstances();
  const { costs: firestoreCosts, loading: loadingCosts, error: costsError } = useMonthlyCosts('alvi', selectedMonth);
  const { summary } = useCostsSummary('alvi');

  // Use Firestore data if available, otherwise mock
  const instances = firestoreInstances.length > 0 ? firestoreInstances : mockInstances;
  const costs: Record<string, MonthlyCost> = firestoreCosts 
    ? { [firestoreCosts.instanceId]: firestoreCosts } 
    : mockCosts;

  const isLoading = loadingInstances || loadingCosts;
  const hasError = instancesError || costsError;
  const isLiveData = firestoreCosts !== null;

  const totalCost = summary?.totalMtd || Object.values(costs).reduce((sum, c) => sum + c.total, 0);
  const budgetUsage = (totalCost / budget) * 100;
  
  // Aggregate by provider
  const byProvider = Object.values(costs).reduce((acc, c) => {
    Object.entries(c.byProvider || {}).forEach(([provider, amount]) => {
      acc[provider] = (acc[provider] || 0) + (typeof amount === 'number' ? amount : 0);
    });
    return acc;
  }, {} as Record<string, number>);

  // Aggregate by model
  const byModel = Object.values(costs).reduce((acc, c) => {
    Object.entries(c.byModel || {}).forEach(([model, amount]) => {
      acc[model] = (acc[model] || 0) + (typeof amount === 'number' ? amount : 0);
    });
    return acc;
  }, {} as Record<string, number>);

  // Chart data
  const dailyData = costs.alvi?.dailyCosts?.map((d) => ({
    date: typeof d.date === 'string' ? d.date.slice(5) : '', // MM-DD
    Coste: d.total || 0,
  })) || [];

  const providerChartData = Object.entries(byProvider).map(([name, value]) => ({
    name: name === 'gcp-infra' ? 'GCP Infra' : name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: name === 'anthropic' ? 'orange.6' : name === 'google' ? 'blue.6' : name === 'gcp-infra' ? 'green.6' : 'gray.6',
  }));

  const modelChartData = Object.entries(byModel).map(([name, value]) => ({
    name: name.split('/').pop() || name,
    value,
    color: name.includes('opus') ? 'orange.6' : name.includes('sonnet') ? 'yellow.6' : 'blue.6',
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const daysInMonth = 28; // Feb
  const daysElapsed = new Date().getDate();
  const projectedTotal = daysElapsed > 0 ? (totalCost / daysElapsed) * daysInMonth : 0;

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Group gap="sm">
            <Title order={2}>Control de Costes</Title>
            {isLiveData && (
              <Badge color="green" variant="light" leftSection={<IconRefresh size={12} />}>
                Datos en vivo
              </Badge>
            )}
            {budgetUsage > 80 && (
              <Badge color="red" leftSection={<IconAlertTriangle size={12} />}>
                {budgetUsage.toFixed(0)}% del presupuesto
              </Badge>
            )}
          </Group>
          <Text c="dimmed" mt={4}>
            Monitoriza el gasto en tokens e infraestructura de tus instancias
          </Text>
          {summary?.lastUpdated && (
            <Text c="dimmed" size="xs" mt={2}>
              Última actualización: {new Date(summary.lastUpdated).toLocaleString('es-ES')}
            </Text>
          )}
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

      {/* Data source indicator */}
      {isLiveData ? (
        <Alert color="green" mb="xl" icon={<IconRefresh />}>
          <Group justify="space-between">
            <Text size="sm">
              <strong>✅ DATOS REALES</strong> — Conectado a Cloud Billing API + Firestore.
              {summary?.lastUpdated && ` Última sync: ${new Date(summary.lastUpdated).toLocaleString('es-ES')}`}
            </Text>
            <Badge color="green" variant="filled">LIVE</Badge>
          </Group>
        </Alert>
      ) : (
        <Alert color="orange" mb="xl" icon={<IconAlertTriangle />}>
          <Group justify="space-between">
            <Text size="sm">
              <strong>⚠️ DATOS DE EJEMPLO</strong> — No hay datos en Firestore o no estás autenticado correctamente.
              {hasError && ` Error: ${instancesError?.message || costsError?.message}`}
            </Text>
            <Badge color="orange" variant="filled">MOCK</Badge>
          </Group>
        </Alert>
      )}

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
          value={formatCurrency(daysElapsed > 0 ? totalCost / daysElapsed : 0)}
          subtitle={`${daysElapsed} días transcurridos`}
          icon={<IconReceipt size={20} />}
          color="violet"
          trend={summary ? { value: Math.round(((summary.totalApi / (summary.totalInfra || 1)) - 1) * 100), label: 'API vs Infra' } : undefined}
        />
        <Paper p="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed" fw={500} mb="xs">Presupuesto mensual</Text>
          <Group>
            <NumberInput
              value={budget}
              onChange={(v) => setBudget(Number(v) || 100)}
              prefix="€"
              min={10}
              max={1000}
              step={10}
              style={{ flex: 1 }}
            />
            <Button variant="light" size="sm">Guardar</Button>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Infra vs API breakdown */}
      {summary && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xl">
          <Paper p="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={600}>🖥️ Infraestructura GCP</Text>
              <Badge color="green" variant="light">{formatCurrency(summary.totalInfra)}</Badge>
            </Group>
            <Text c="dimmed" size="sm">e2-medium · europe-west1 · €24.75/mes</Text>
          </Paper>
          <Paper p="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={600}>🤖 APIs (Anthropic, Google)</Text>
              <Badge color="orange" variant="light">{formatCurrency(summary.totalApi)}</Badge>
            </Group>
            <Text c="dimmed" size="sm">Claude Opus 4.5 · Tokens: {Object.values(costs)[0]?.tokensByModel ? 
              Object.values(Object.values(costs)[0].tokensByModel).reduce((sum: number, t: any) => sum + (t.input || 0) + (t.output || 0), 0).toLocaleString() : '0'}</Text>
          </Paper>
        </SimpleGrid>
      )}

      {/* Charts Row */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="xl">
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Gasto diario</Text>
          {dailyData.length > 0 ? (
            <AreaChart
              h={250}
              data={dailyData}
              dataKey="date"
              series={[{ name: 'Coste', color: 'blue.6' }]}
              curveType="natural"
              withDots={false}
              gridAxis="xy"
              valueFormatter={(value) => `€${value.toFixed(2)}`}
            />
          ) : (
            <Center h={250}>
              <Text c="dimmed">Sin datos de gasto diario</Text>
            </Center>
          )}
        </Paper>

        <SimpleGrid cols={2}>
          <Paper p="lg" radius="md" withBorder>
            <Text fw={600} mb="md">Por proveedor</Text>
            {providerChartData.length > 0 ? (
              <DonutChart
                h={200}
                data={providerChartData}
                withLabelsLine
                withLabels
                tooltipDataSource="segment"
                valueFormatter={(value) => `€${value.toFixed(2)}`}
              />
            ) : (
              <Center h={200}>
                <Text c="dimmed">Sin datos</Text>
              </Center>
            )}
          </Paper>
          <Paper p="lg" radius="md" withBorder>
            <Text fw={600} mb="md">Por modelo</Text>
            {modelChartData.length > 0 ? (
              <DonutChart
                h={200}
                data={modelChartData}
                withLabelsLine
                withLabels
                tooltipDataSource="segment"
                valueFormatter={(value) => `€${value.toFixed(2)}`}
              />
            ) : (
              <Center h={200}>
                <Text c="dimmed">Sin datos</Text>
              </Center>
            )}
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
