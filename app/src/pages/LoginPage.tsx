import { Box, Button, Center, Paper, Stack, Text, Title, Alert, Loader } from '@mantine/core';
import { IconBrandGoogle, IconAlertCircle } from '@tabler/icons-react';
import { useAuthState } from '@/hooks/useAuth';

export function LoginPage() {
  const { loading, error, signInWithGoogle } = useAuthState();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // App.tsx will re-render and show main app when user is set
    } catch (err) {
      // Error is handled in useAuthState
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
            <Text size="xs" c="dimmed" ff="monospace">build: {__BUILD_ID__}</Text>
            <Text c="dimmed" size="sm">
              Panel de control para OpenClaw
            </Text>
          </Box>

          {error && (
            <Alert 
              color="red" 
              icon={<IconAlertCircle size={16} />}
              w="100%"
            >
              {error}
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
