import { Box, Title, Text, Paper, Stack, Switch, Select, TextInput, Button, Group, Divider, NumberInput, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';

export function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications24h, setNotifications24h] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [budgetThreshold, setBudgetThreshold] = useState(80);
  const [defaultModel, setDefaultModel] = useState('anthropic/claude-opus-4-5');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      notifications.show({
        title: 'Guardado',
        message: 'Configuración actualizada',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    }, 500);
  };

  return (
    <Box p="xl">
      <Title order={2} mb="xs">Ajustes</Title>
      <Text c="dimmed" mb="xl">
        Configuración general del dashboard
      </Text>

      <Stack gap="lg" maw={600}>
        {/* Appearance */}
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Apariencia</Text>
          <Stack gap="md">
            <Switch
              label="Modo oscuro"
              description="Usar tema oscuro en el dashboard"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
          </Stack>
        </Paper>

        {/* Notifications */}
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Notificaciones</Text>
          <Stack gap="md">
            <Switch
              label="Notificaciones 24h"
              description="Recibir notificaciones fuera del horario de oficina"
              checked={notifications24h}
              onChange={(e) => setNotifications24h(e.target.checked)}
            />
            <Divider />
            <Switch
              label="Alertas de presupuesto"
              description="Notificar cuando el gasto supere el umbral"
              checked={budgetAlerts}
              onChange={(e) => setBudgetAlerts(e.target.checked)}
            />
            {budgetAlerts && (
              <NumberInput
                label="Umbral de alerta (%)"
                value={budgetThreshold}
                onChange={(v) => setBudgetThreshold(Number(v) || 80)}
                min={50}
                max={100}
                step={5}
                suffix="%"
                w={150}
              />
            )}
          </Stack>
        </Paper>

        {/* Defaults */}
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Valores por defecto</Text>
          <Stack gap="md">
            <Select
              label="Modelo por defecto"
              description="Modelo a usar cuando no se especifique otro"
              value={defaultModel}
              onChange={(v) => setDefaultModel(v || '')}
              data={[
                { value: 'anthropic/claude-opus-4-5', label: 'Claude Opus 4.5' },
                { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
                { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
              ]}
            />
          </Stack>
        </Paper>

        {/* Firebase */}
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={600}>Firebase</Text>
            <Badge color="green" variant="dot">Conectado</Badge>
          </Group>
          <Stack gap="md">
            <TextInput
              label="Project ID"
              value="openclaw-dashboard"
              disabled
            />
            <TextInput
              label="Región"
              value="europe-west1"
              disabled
            />
          </Stack>
        </Paper>

        {/* Account */}
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Cuenta</Text>
          <Stack gap="md">
            <TextInput
              label="Email"
              value="diegoferrandezsempere@gmail.com"
              disabled
            />
            <Button variant="subtle" color="red">
              Cerrar sesión
            </Button>
          </Stack>
        </Paper>

        {/* Save */}
        <Group justify="flex-end">
          <Button onClick={handleSave} loading={saving}>
            Guardar cambios
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
