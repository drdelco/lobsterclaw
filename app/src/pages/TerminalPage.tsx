import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Title, Text, Group, Badge, Button, ActionIcon, Paper, Stack, Tooltip, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTerminal2, IconPlugConnected, IconPlugConnectedX, IconRefresh, IconChevronRight, IconCommand, IconSend } from '@tabler/icons-react';

const SYNC_TOKEN = 'lobsterclaw-sync-2026';
const WS_URL = `wss://ssh.ngclinicas.com/terminal/ws?token=${SYNC_TOKEN}`;

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

// Strip ANSI escape codes for clean display
function stripAnsi(str: string): string {
  return str
    .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '')   // CSI sequences (including ? variants)
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')  // OSC sequences
    .replace(/\x1b[()][0-9A-B]/g, '')           // Character set selection
    .replace(/\x1b\[[\d;]*m/g, '')              // SGR (color) sequences
    .replace(/\r/g, '');                         // Carriage returns
}

export function TerminalPage() {
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [paletteOpened, { toggle: togglePalette }] = useDisclosure(true);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, 20);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;
    setStatus('connecting');
    setOutput(prev => prev + '⏳ Conectando...\n');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        setOutput(prev => prev + '✅ Conectado al servidor\n\n');
        scrollToBottom();
      };

      ws.onmessage = (event) => {
        const clean = stripAnsi(event.data);
        setOutput(prev => {
          const next = prev + clean;
          return next.length > 80000 ? next.slice(-80000) : next;
        });
        scrollToBottom();
      };

      ws.onclose = () => {
        setStatus('disconnected');
        setOutput(prev => prev + '\n❌ Desconectado\n');
      };

      ws.onerror = () => {
        setStatus('disconnected');
        setOutput(prev => prev + '\n⚠️ Error de conexión\n');
      };
    } catch (err) {
      setStatus('disconnected');
      setOutput(prev => prev + '\n⚠️ No se pudo conectar: ' + String(err) + '\n');
    }
  }, [scrollToBottom]);

  const sendCommand = useCallback((command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(command + '\n');
      setHistory(prev => [command, ...prev].slice(0, 50));
      setHistoryIdx(-1);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        sendCommand(input);
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

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
            leftSection={status === 'connected' ? <IconPlugConnected size={14} /> : <IconPlugConnectedX size={14} />}
          >
            {statusLabel}
          </Badge>
        </Group>
        <Group gap="xs">
          {status === 'disconnected' && (
            <Button size="xs" variant="light" leftSection={<IconRefresh size={14} />} onClick={connect}>
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

      {/* Main area */}
      <Group gap="sm" align="stretch" wrap="nowrap" style={{ flex: 1, minHeight: 0 }}>
        {/* Terminal */}
        <Paper
          radius="md"
          style={{
            flex: 1,
            overflow: 'hidden',
            border: '1px solid var(--mantine-color-dark-4)',
            backgroundColor: '#0d1117',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Output */}
          <div
            ref={outputRef}
            onClick={() => inputRef.current?.focus()}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
              fontSize: 13,
              lineHeight: 1.6,
              color: '#c9d1d9',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {output || '💻 Terminal listo. Pulsa Reconectar si no se conecta automáticamente.'}
          </div>

          {/* Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            borderTop: '1px solid #30363d',
            padding: '8px 12px',
            backgroundColor: '#161b22',
            gap: 8,
          }}>
            <Text size="sm" c="green" ff="monospace" fw={700}>$</Text>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status !== 'connected'}
              placeholder={status === 'connected' ? 'Escribe un comando...' : 'Desconectado'}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#c9d1d9',
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, monospace",
                fontSize: 13,
              }}
            />
            <ActionIcon
              variant="subtle"
              color="green"
              disabled={status !== 'connected' || !input.trim()}
              onClick={() => { sendCommand(input); setInput(''); }}
            >
              <IconSend size={16} />
            </ActionIcon>
          </div>
        </Paper>

        {/* Command Palette */}
        {paletteOpened && (
          <Paper
            radius="md"
            withBorder
            p="xs"
            style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
          >
            <Group gap="xs" mb="xs">
              <IconCommand size={16} />
              <Text size="sm" fw={600}>Comandos rápidos</Text>
            </Group>
            <ScrollArea style={{ flex: 1 }}>
              <Stack gap={4}>
                {QUICK_COMMANDS.map((cmd) => (
                  <Tooltip key={cmd.label} label={cmd.command} position="left" multiline maw={300} withArrow>
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
