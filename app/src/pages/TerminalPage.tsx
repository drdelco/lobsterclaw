import { Box, Title, Text, Paper, Stack, Alert, Button, Group } from '@mantine/core';
import { IconTerminal2, IconBrandTelegram, IconLock } from '@tabler/icons-react';

export function TerminalPage() {
  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2}>Terminal</Title>
          <Text c="dimmed" mt={4}>
            Acceso a línea de comandos del servidor
          </Text>
        </Box>
      </Group>

      <Alert color="blue" icon={<IconLock />} mb="xl">
        <Text size="sm">
          <strong>🔒 Acceso seguro</strong> — Por seguridad, el terminal web está en desarrollo.
          Usa Telegram para ejecutar comandos a través de Alvi.
        </Text>
      </Alert>

      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" gap="lg" py="xl">
          <IconTerminal2 size={64} style={{ opacity: 0.5 }} />
          <Text size="lg" fw={500}>Terminal próximamente</Text>
          <Text c="dimmed" ta="center" maw={400}>
            Estamos trabajando en un acceso seguro a la terminal del servidor.
            Mientras tanto, puedes usar Telegram para ejecutar comandos.
          </Text>
          <Button
            component="a"
            href="https://t.me/AlviClawBot"
            target="_blank"
            leftSection={<IconBrandTelegram size={18} />}
            variant="light"
          >
            Abrir Telegram
          </Button>
        </Stack>
      </Paper>

      <Paper p="lg" mt="xl" radius="md" withBorder bg="dark.7">
        <Text size="sm" fw={500} c="dimmed" mb="md">Ejemplos de comandos vía Telegram:</Text>
        <Stack gap="xs">
          <Text size="sm" ff="monospace" c="green.4">
            &gt; ejecuta `ls -la` en el servidor
          </Text>
          <Text size="sm" ff="monospace" c="green.4">
            &gt; qué procesos están corriendo?
          </Text>
          <Text size="sm" ff="monospace" c="green.4">
            &gt; reinicia el gateway
          </Text>
          <Text size="sm" ff="monospace" c="green.4">
            &gt; muestra el log de los últimos errores
          </Text>
        </Stack>
      </Paper>
    </Box>
  );
}
