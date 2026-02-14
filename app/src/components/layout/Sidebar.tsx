import { NavLink, Stack, Text, Group, Box, ActionIcon, Tooltip } from '@mantine/core';
import {
  IconDeviceDesktop,
  IconClock,
  IconMessageCircle,
  IconCurrencyDollar,
  IconRobot,
  IconFileText,
  IconTerminal2,
  IconSettings,
  IconLogout,
  IconMoon,
  IconSun,
} from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'instances', label: 'Instancias', icon: IconDeviceDesktop },
  { id: 'cron', label: 'Cron Jobs', icon: IconClock },
  { id: 'chat', label: 'Chat', icon: IconMessageCircle },
  { id: 'costs', label: 'Costes', icon: IconCurrencyDollar },
  { id: 'llms', label: 'LLMs', icon: IconRobot },
  { id: 'config', label: 'Configuración', icon: IconFileText },
  { id: 'terminal', label: 'Terminal', icon: IconTerminal2 },
];

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Box
      component="aside"
      w={260}
      h="100vh"
      bg="dark.8"
      style={{ borderRight: '1px solid var(--mantine-color-dark-6)' }}
    >
      <Stack h="100%" gap={0}>
        {/* Logo */}
        <Box p="lg" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
          <Group gap="sm">
            <Text size="2rem">🦞</Text>
            <Box>
              <Text fw={700} size="lg" c="white">OpenClaw</Text>
              <Text size="xs" c="dimmed">Command Center</Text>
            </Box>
          </Group>
        </Box>

        {/* Navigation */}
        <Stack gap={4} p="md" style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              active={currentPage === item.id}
              onClick={() => onNavigate(item.id)}
              variant="filled"
              styles={{
                root: {
                  borderRadius: 'var(--mantine-radius-md)',
                },
              }}
            />
          ))}
        </Stack>

        {/* Bottom actions */}
        <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}>
          <Stack gap={4}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed">Tema</Text>
              <Tooltip label={colorScheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
                <ActionIcon
                  variant="subtle"
                  onClick={() => toggleColorScheme()}
                  size="sm"
                >
                  {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
                </ActionIcon>
              </Tooltip>
            </Group>
            <NavLink
              label="Ajustes"
              leftSection={<IconSettings size={20} stroke={1.5} />}
              active={currentPage === 'settings'}
              onClick={() => onNavigate('settings')}
              variant="subtle"
              styles={{
                root: {
                  borderRadius: 'var(--mantine-radius-md)',
                },
              }}
            />
            <NavLink
              label="Cerrar sesión"
              leftSection={<IconLogout size={20} stroke={1.5} />}
              onClick={onLogout}
              variant="subtle"
              c="red"
              styles={{
                root: {
                  borderRadius: 'var(--mantine-radius-md)',
                },
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
