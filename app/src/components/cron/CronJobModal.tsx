import { Modal, TextInput, Textarea, Select, NumberInput, Stack, Group, Button, SegmentedControl, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import type { CronJob, Instance } from '@/types';

interface CronJobModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (job: Partial<CronJob>) => void;
  instances: Instance[];
  editingJob?: CronJob;
}

export function CronJobModal({ opened, onClose, onSubmit, instances, editingJob }: CronJobModalProps) {
  const [scheduleType, setScheduleType] = useState<'every' | 'cron' | 'at'>(
    editingJob?.schedule.kind || 'every'
  );
  const [payloadType, setPayloadType] = useState<'systemEvent' | 'agentTurn'>(
    editingJob?.payload.kind || 'systemEvent'
  );

  const form = useForm({
    initialValues: {
      name: editingJob?.name || '',
      instanceId: editingJob?.instanceId || instances[0]?.id || '',
      // Schedule
      everyMinutes: 30,
      cronExpr: '0 9 * * *',
      atDate: '',
      atTime: '',
      // Payload
      text: editingJob?.payload.kind === 'systemEvent' ? editingJob.payload.text : '',
      message: editingJob?.payload.kind === 'agentTurn' ? editingJob.payload.message : '',
      model: editingJob?.payload.kind === 'agentTurn' ? editingJob.payload.model || '' : '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Nombre muy corto' : null),
      instanceId: (value) => (!value ? 'Selecciona una instancia' : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    let schedule: CronJob['schedule'];
    switch (scheduleType) {
      case 'every':
        schedule = { kind: 'every', everyMs: values.everyMinutes * 60 * 1000 };
        break;
      case 'cron':
        schedule = { kind: 'cron', expr: values.cronExpr };
        break;
      case 'at':
        schedule = { kind: 'at', at: new Date(`${values.atDate}T${values.atTime}`).toISOString() };
        break;
    }

    let payload: CronJob['payload'];
    switch (payloadType) {
      case 'systemEvent':
        payload = { kind: 'systemEvent', text: values.text };
        break;
      case 'agentTurn':
        payload = { 
          kind: 'agentTurn', 
          message: values.message,
          ...(values.model ? { model: values.model } : {}),
        };
        break;
    }

    onSubmit({
      id: editingJob?.id,
      name: values.name,
      instanceId: values.instanceId,
      schedule,
      payload,
      enabled: true,
    });
    onClose();
  });

  // Common cron presets
  const cronPresets = [
    { label: 'Cada hora', value: '0 * * * *' },
    { label: 'Cada día 9:00', value: '0 9 * * *' },
    { label: 'Cada lunes 9:00', value: '0 9 * * 1' },
    { label: 'Cada 1º de mes', value: '0 9 1 * *' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingJob ? 'Editar Cron Job' : 'Nuevo Cron Job'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Nombre"
            placeholder="Ej: Revisión de emails"
            required
            {...form.getInputProps('name')}
          />

          <Select
            label="Instancia"
            placeholder="Selecciona instancia"
            required
            data={instances.map((i) => ({ value: i.id, label: `${i.emoji || '🤖'} ${i.name}` }))}
            {...form.getInputProps('instanceId')}
          />

          {/* Schedule Type */}
          <div>
            <Text size="sm" fw={500} mb={4}>Programación</Text>
            <SegmentedControl
              fullWidth
              value={scheduleType}
              onChange={(v) => setScheduleType(v as 'every' | 'cron' | 'at')}
              data={[
                { label: 'Intervalo', value: 'every' },
                { label: 'Cron', value: 'cron' },
                { label: 'Una vez', value: 'at' },
              ]}
            />
          </div>

          {scheduleType === 'every' && (
            <NumberInput
              label="Cada X minutos"
              min={1}
              max={1440}
              {...form.getInputProps('everyMinutes')}
            />
          )}

          {scheduleType === 'cron' && (
            <div>
              <TextInput
                label="Expresión Cron"
                placeholder="0 9 * * *"
                {...form.getInputProps('cronExpr')}
              />
              <Group gap="xs" mt="xs">
                {cronPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="light"
                    size="xs"
                    onClick={() => form.setFieldValue('cronExpr', preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </Group>
              <Text size="xs" c="dimmed" mt="xs">
                Formato: minuto hora día mes díaSemana
              </Text>
            </div>
          )}

          {scheduleType === 'at' && (
            <Group grow>
              <TextInput
                type="date"
                label="Fecha"
                {...form.getInputProps('atDate')}
              />
              <TextInput
                type="time"
                label="Hora"
                {...form.getInputProps('atTime')}
              />
            </Group>
          )}

          {/* Payload Type */}
          <div>
            <Text size="sm" fw={500} mb={4}>Tipo de tarea</Text>
            <SegmentedControl
              fullWidth
              value={payloadType}
              onChange={(v) => setPayloadType(v as 'systemEvent' | 'agentTurn')}
              data={[
                { label: 'System Event', value: 'systemEvent' },
                { label: 'Agent Turn', value: 'agentTurn' },
              ]}
            />
            <Text size="xs" c="dimmed" mt={4}>
              {payloadType === 'systemEvent' 
                ? 'Inyecta texto en la sesión principal' 
                : 'Ejecuta el agente en sesión aislada'}
            </Text>
          </div>

          {payloadType === 'systemEvent' && (
            <Textarea
              label="Texto del evento"
              placeholder="Ej: Revisa los emails pendientes"
              minRows={3}
              {...form.getInputProps('text')}
            />
          )}

          {payloadType === 'agentTurn' && (
            <>
              <Textarea
                label="Mensaje para el agente"
                placeholder="Ej: Genera el informe semanal"
                minRows={3}
                {...form.getInputProps('message')}
              />
              <Select
                label="Modelo (opcional)"
                placeholder="Usar el modelo por defecto"
                clearable
                data={[
                  { value: 'anthropic/claude-opus-4-5', label: 'Claude Opus' },
                  { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet' },
                  { value: 'google/gemini-2.5-pro', label: 'Gemini Pro' },
                ]}
                {...form.getInputProps('model')}
              />
            </>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{editingJob ? 'Guardar' : 'Crear'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
