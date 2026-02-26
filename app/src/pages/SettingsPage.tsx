import { useState, useEffect } from 'react';
import { Box, Title, Text, Paper, Stack, Switch, Button, Group, Badge, Alert, Loader, TextInput, ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconServer, IconRefresh, IconAlertTriangle, IconFingerprint, IconTrash, IconPlus } from '@tabler/icons-react';
import { useAuthState } from '@/hooks/useAuth';
import { usePasskeys } from '@/hooks/usePasskeys';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function SettingsPage() {
  const { user } = useAuthState();
  const { passkeys, loading: passkeysLoading, error: passkeysError, registerPasskey, deletePasskey } = usePasskeys(user?.uid);
  const [darkMode, setDarkMode] = useState(true);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [serverTimestamp, setServerTimestamp] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [passkeyLabel, setPasskeyLabel] = useState('');
  const [registering, setRegistering] = useState(false);

  const checkServer = async () => {
    setChecking(true);
    setServerStatus('checking');
    try {
      const response = await fetch('http://35.241.159.137:8787/health', {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        setServerStatus('online');
        setServerTimestamp(data.timestamp);
      } else {
        setServerStatus('offline');
      }
    } catch (err) {
      setServerStatus('offline');
    }
    setChecking(false);
  };

  useEffect(() => {
    checkServer();
  }, []);

  // Ensure user doc exists in Firestore (for passkey login lookup)
  useEffect(() => {
    if (user) {
      setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    }
  }, [user]);

  const handleRegisterPasskey = async () => {
    setRegistering(true);
    try {
      await registerPasskey(passkeyLabel || 'Mi dispositivo');
      setPasskeyLabel('');
      notifications.show({
        title: 'Passkey registrada',
        message: 'Ahora puedes usar tu huella/biometría para iniciar sesión',
        color: 'green',
      });
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        notifications.show({
          title: 'Error',
          message: err.message || 'No se pudo registrar la passkey',
          color: 'red',
        });
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDeletePasskey = async (credentialId: string) => {
    try {
      await deletePasskey(credentialId);
      notifications.show({
        title: 'Passkey eliminada',
        message: 'La passkey ha sido eliminada',
        color: 'orange',
      });
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || 'No se pudo eliminar',
        color: 'red',
      });
    }
  };

  return (
    <Box p="xl">
      <Title order={2} mb="xs">Ajustes</Title>
      <Text c="dimmed" mb="xl">
        Configuración general del dashboard
      </Text>

      <Stack gap="lg" maw={600}>
        {/* Server status */}
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <IconServer size={20} />
              <Text fw={600}>Estado del servidor</Text>
            </Group>
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconRefresh size={14} />}
              onClick={checkServer}
              loading={checking}
            >
              Verificar
            </Button>
          </Group>

          {serverStatus === 'checking' ? (
            <Group gap="sm">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">Comprobando conexión...</Text>
            </Group>
          ) : serverStatus === 'online' ? (
            <Alert color="green" icon={<IconCheck />}>
              <Group justify="space-between">
                <Text size="sm">
                  <strong>Servidor online</strong>
                  {serverTimestamp && ` · ${new Date(serverTimestamp).toLocaleString('es-ES')}`}
                </Text>
                <Badge color="green">CONECTADO</Badge>
              </Group>
            </Alert>
          ) : (
            <Alert color="red" icon={<IconAlertTriangle />}>
              <Group justify="space-between">
                <Text size="sm">
                  <strong>Servidor offline</strong> — El sync server no responde
                </Text>
                <Badge color="red">DESCONECTADO</Badge>
              </Group>
            </Alert>
          )}

          <Stack gap="xs" mt="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">IP:</Text>
              <Text size="sm" ff="monospace">35.241.159.137:8787</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Proyecto Firebase:</Text>
              <Text size="sm" ff="monospace">lobsterclaw-c9af9</Text>
            </Group>
          </Stack>
        </Paper>

        {/* Passkeys / Biometric Auth */}
        <Paper p="lg" radius="md" withBorder>
          <Group gap="sm" mb="md">
            <IconFingerprint size={20} />
            <Text fw={600}>Autenticación biométrica</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            Registra una passkey para iniciar sesión con huella digital o reconocimiento facial.
          </Text>

          {/* Registered passkeys */}
          {passkeys.length > 0 && (
            <Stack gap="xs" mb="md">
              {passkeys.map((pk) => (
                <Group key={pk.credentialId} justify="space-between" p="xs" style={{ borderRadius: 'var(--mantine-radius-sm)', background: 'var(--mantine-color-dark-6)' }}>
                  <Group gap="sm">
                    <IconFingerprint size={16} />
                    <div>
                      <Text size="sm" fw={500}>{pk.label}</Text>
                      <Text size="xs" c="dimmed">
                        Registrada: {new Date(pk.createdAt).toLocaleDateString('es-ES')}
                      </Text>
                    </div>
                  </Group>
                  <Tooltip label="Eliminar passkey">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => handleDeletePasskey(pk.credentialId)}
                      loading={passkeysLoading}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ))}
            </Stack>
          )}

          {passkeys.length === 0 && !passkeysLoading && (
            <Alert color="blue" variant="light" mb="md">
              <Text size="sm">No tienes passkeys registradas. Registra una para acceder con biometría.</Text>
            </Alert>
          )}

          {passkeysError && (
            <Alert color="red" mb="md">
              <Text size="sm">{passkeysError}</Text>
            </Alert>
          )}

          <Group gap="xs">
            <TextInput
              placeholder="Nombre del dispositivo"
              value={passkeyLabel}
              onChange={(e) => setPasskeyLabel(e.currentTarget.value)}
              style={{ flex: 1 }}
              size="sm"
            />
            <Button
              leftSection={<IconPlus size={14} />}
              onClick={handleRegisterPasskey}
              loading={registering}
              size="sm"
            >
              Registrar passkey
            </Button>
          </Group>
        </Paper>

        {/* Appearance */}
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Apariencia</Text>
          <Stack gap="md">
            <Switch
              label="Modo oscuro"
              description="Usar tema oscuro en el dashboard (siempre activo)"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              disabled
            />
          </Stack>
        </Paper>

        {/* About */}
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Acerca de</Text>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Dashboard:</Text>
              <Text size="sm">Lobsterclaw v1.0</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Agente:</Text>
              <Text size="sm">Alvi</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Instancia:</Text>
              <Text size="sm">GCP e2-medium (europe-west1)</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Modelo principal:</Text>
              <Badge variant="light">anthropic/claude-opus-4-5</Badge>
            </Group>
          </Stack>
        </Paper>

        {/* Actions */}
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Acciones</Text>
          <Stack gap="sm">
            <Button
              variant="light"
              fullWidth
              onClick={async () => {
                try {
                  const res = await fetch('http://35.241.159.137:8787/sync/all', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer lobsterclaw-sync-2026' },
                  });
                  if (res.ok) {
                    notifications.show({
                      title: 'Sincronización completa',
                      message: 'Todos los datos actualizados',
                      color: 'green',
                    });
                  }
                } catch (e) {
                  notifications.show({ title: 'Error', message: 'No se pudo sincronizar', color: 'red' });
                }
              }}
            >
              Sincronizar todo ahora
            </Button>
            <Button
              variant="subtle"
              color="red"
              fullWidth
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Limpiar caché local
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
