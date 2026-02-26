import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Title, Text, Group, Badge, Button, ActionIcon, Paper, Stack, Tooltip, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTerminal2, IconPlugConnected, IconPlugConnectedX, IconRefresh, IconChevronRight, IconCommand } from '@tabler/icons-react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

const SYNC_TOKEN = 'lobsterclaw-sync-2026';
const WS_URL = `ws://35.241.159.137:8787/terminal/ws?token=${SYNC_TOKEN}`;

const QUICK_COMMANDS = [
  { emoji: '🔍', label: 'Estado del gateway', command: 'systemctl --user status openclaw-gateway.service' },
  { emoji: '🔄', label: 'Reiniciar gateway', command: 'systemctl --user restart openclaw-gateway.service' },
  { emoji: '⬆️', label: 'Actualizar OpenClaw', command: 'npm update -g openclaw && systemctl --user restart openclaw-gateway.service' },
  { emoji: '📋', label: 'Logs del gateway', command: 'journalctl --user -u openclaw-gateway.service --no-pager -n 50' },
  { emoji: '💾', label: 'Espacio en disco', command: 'df -h' },
  { emoji: '🧠', label: 'Memoria', command: 'free -h' },
  { emoji: '📊', label: 'Procesos (top)', command: 'top -bn1 | head -20' },
  { emoji: '📄', label: 'Log sync-server', command: 'tail -50 /tmp/sync-server.log' },
  { emoji: '🏷️', label: 'Versión OpenClaw', command: 'openclaw --version' },
  { emoji: '🌐', label: 'Puertos abiertos', command: 'ss -tlnp' },
  { emoji: '📁', label: 'Tamaño workspace', command: 'du -sh ~/.openclaw/workspace/*' },
  { emoji: '👤', label: 'Usuarios conectados', command: 'who' },
] as const;

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [paletteOpened, { toggle: togglePalette }] = useDisclosure(true);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) {
      return;
    }

    setStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      // Send initial resize
      if (fitAddonRef.current && termRef.current) {
        const dims = fitAddonRef.current.proposeDimensions();
        if (dims) {
          ws.send(JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }));
        }
      }
    };

    ws.onmessage = (event) => {
      termRef.current?.write(event.data);
    };

    ws.onclose = () => {
      setStatus('disconnected');
    };

    ws.onerror = () => {
      setStatus('disconnected');
    };
  }, []);

  const sendCommand = useCallback((command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(command + '\n');
    }
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
      theme: {
        background: '#1a1b1e',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        selectionBackground: 'rgba(56, 139, 253, 0.3)',
        black: '#0d1117',
        red: '#ff7b72',
        green: '#7ee787',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#c9d1d9',
        brightBlack: '#484f58',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Fit terminal
    setTimeout(() => fitAddon.fit(), 0);

    // Send typed input to WebSocket
    term.onData((data) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
        const dims = fitAddon.proposeDimensions();
        if (dims && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }));
        }
      } catch {}
    });

    resizeObserver.observe(terminalRef.current);

    // Connect automatically
    connect();

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statusColor = status === 'connected' ? 'green' : status === 'connecting' ? 'yellow' : 'red';
  const statusLabel = status === 'connected' ? 'Conectado' : status === 'connecting' ? 'Conectando...' : 'Desconectado';

  return (
    <Box p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <IconTerminal2 size={24} />
          <Title order={3}>Terminal</Title>
          <Badge
            color={statusColor}
            variant="dot"
            size="lg"
            leftSection={
              status === 'connected'
                ? <IconPlugConnected size={14} />
                : <IconPlugConnectedX size={14} />
            }
          >
            {statusLabel}
          </Badge>
        </Group>
        <Group gap="xs">
          {status === 'disconnected' && (
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              onClick={connect}
            >
              Reconectar
            </Button>
          )}
          <Tooltip label={paletteOpened ? 'Ocultar comandos' : 'Mostrar comandos'}>
            <ActionIcon variant="subtle" onClick={togglePalette} size="lg">
              {paletteOpened ? <IconChevronRight size={18} /> : <IconCommand size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Main area: terminal + command palette */}
      <Group gap="sm" align="stretch" wrap="nowrap" style={{ flex: 1, minHeight: 0 }}>
        {/* Terminal */}
        <Paper
          radius="md"
          style={{
            flex: 1,
            overflow: 'hidden',
            border: '1px solid var(--mantine-color-dark-4)',
            backgroundColor: '#1a1b1e',
            display: 'flex',
          }}
        >
          <div
            ref={terminalRef}
            style={{
              flex: 1,
              padding: '4px',
            }}
          />
        </Paper>

        {/* Command Palette */}
        {paletteOpened && (
          <Paper
            radius="md"
            withBorder
            p="xs"
            style={{
              width: 240,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Group gap="xs" mb="xs">
              <IconCommand size={16} />
              <Text size="sm" fw={600}>Comandos rápidos</Text>
            </Group>
            <ScrollArea style={{ flex: 1 }}>
              <Stack gap={4}>
                {QUICK_COMMANDS.map((cmd) => (
                  <Tooltip
                    key={cmd.label}
                    label={cmd.command}
                    position="left"
                    multiline
                    maw={300}
                    withArrow
                  >
                    <Button
                      variant="subtle"
                      size="compact-sm"
                      justify="flex-start"
                      fullWidth
                      onClick={() => sendCommand(cmd.command)}
                      disabled={status !== 'connected'}
                      styles={{
                        root: { fontWeight: 400, height: 'auto', padding: '6px 8px' },
                        label: { whiteSpace: 'normal' },
                      }}
                    >
                      <Group gap={6} wrap="nowrap">
                        <Text size="sm">{cmd.emoji}</Text>
                        <Text size="xs">{cmd.label}</Text>
                      </Group>
                    </Button>
                  </Tooltip>
                ))}
              </Stack>
            </ScrollArea>
          </Paper>
        )}
      </Group>
    </Box>
  );
}
