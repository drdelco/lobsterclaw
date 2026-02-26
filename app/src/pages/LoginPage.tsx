import { useState } from 'react';
import { Box, Button, Center, Paper, Stack, Text, Title, Alert, Loader, Divider } from '@mantine/core';
import { IconBrandGoogle, IconAlertCircle, IconFingerprint } from '@tabler/icons-react';
import { useAuthState } from '@/hooks/useAuth';
import { authenticateWithPasskey } from '@/hooks/usePasskeys';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function LoginPage() {
  const { loading, error, signInWithGoogle } = useAuthState();
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      // Error is handled in useAuthState
    }
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    try {
      const uid = await authenticateWithPasskey();
      if (!uid) {
        setPasskeyLoading(false);
        return; // User cancelled
      }

      // For client-side passkey auth on a personal dashboard:
      // We verified the passkey matches a stored credential.
      // Now we need to sign in to Firebase. Since we can't create custom tokens client-side,
      // we'll use a stored auth approach: save a passkey-auth token in Firestore on registration
      // and use signInWithCustomToken. For now, we use a workaround:
      // Store the user's email and a special passkey-auth flag to auto-sign-in via Google popup.

      // Fetch user info from Firestore to verify the passkey belongs to a real user
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        // Passkey verified - auto-trigger Google sign-in to complete Firebase auth
        await signInWithGoogle();
      } else {
        setPasskeyError('Usuario no encontrado. Inicia sesión con Google primero.');
      }
    } catch (err: any) {
      setPasskeyError(err.message || 'Error al autenticar con passkey');
    } finally {
      setPasskeyLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh" bg="dark.9">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box
      h="100vh"
      style={{
        background: 'linear-gradient(135deg, #1a1b1e 0%, #25262b 50%, #1a1b1e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        p="xl"
        radius="lg"
        shadow="xl"
        w={400}
        style={{
          background: 'rgba(37, 38, 43, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Stack align="center" gap="lg">
          <Text size="4rem">🦉</Text>

          <Box ta="center">
            <Title order={2} mb={4}>Lobsterclaw Dashboard</Title>
            <Text c="dimmed" size="sm">
              Panel de control para OpenClaw
            </Text>
          </Box>

          {(error || passkeyError) && (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              w="100%"
            >
              {error || passkeyError}
            </Alert>
          )}

          <Button
            size="lg"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            leftSection={<IconBrandGoogle size={20} />}
            onClick={handleGoogleLogin}
            fullWidth
          >
            Iniciar sesión con Google
          </Button>

          <Divider w="100%" label="o" labelPosition="center" />

          <Button
            size="lg"
            variant="light"
            color="grape"
            leftSection={<IconFingerprint size={20} />}
            onClick={handlePasskeyLogin}
            loading={passkeyLoading}
            fullWidth
          >
            Iniciar sesión con huella
          </Button>

          <Text size="xs" c="dimmed" ta="center">
            Solo usuarios autorizados pueden acceder.
            <br />
            Contacta con Diego si necesitas acceso.
          </Text>
        </Stack>
      </Paper>
    </Box>
  );
}
