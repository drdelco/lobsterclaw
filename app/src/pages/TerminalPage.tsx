import { useState, useRef, useEffect } from 'react';
import { Box, Title, Text, Paper, Group, Select, Tabs, Button, TextInput, Stack, ActionIcon, Badge, Tooltip, Code, ScrollArea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTerminal2, IconFolder, IconFile, IconRefresh, IconUpload, IconDownload, IconChevronRight, IconHome } from '@tabler/icons-react';
import type { Instance } from '@/types';

// Mock data
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
    sshConfig: {
      host: '34.76.xxx.xxx',
      port: 22,
      user: 'drdelco',
      keyId: 'default',
    },
  },
];

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  permissions?: string;
}

const mockFiles: FileItem[] = [
  { name: '..', type: 'directory' },
  { name: '.openclaw', type: 'directory', modified: new Date() },
  { name: 'projects', type: 'directory', modified: new Date() },
  { name: 'workspace', type: 'directory', modified: new Date() },
  { name: '.bashrc', type: 'file', size: 3526, modified: new Date(), permissions: '-rw-r--r--' },
  { name: '.profile', type: 'file', size: 807, modified: new Date(), permissions: '-rw-r--r--' },
];

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export function TerminalPage() {
  const [selectedInstance, setSelectedInstance] = useState<string>(mockInstances[0]?.id || '');
  const [activeTab, setActiveTab] = useState<string | null>('terminal');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  // Terminal state
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // SFTP state
  const [currentPath, setCurrentPath] = useState('/home/drdelco');
  const [files] = useState<FileItem[]>(mockFiles);

  const instances = mockInstances;
  const currentInstance = instances.find((i) => i.id === selectedInstance);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleConnect = () => {
    if (!currentInstance?.sshConfig) {
      notifications.show({
        title: 'Error',
        message: 'Esta instancia no tiene SSH configurado',
        color: 'red',
      });
      return;
    }

    setConnecting(true);
    
    // Simulate connection
    setTimeout(() => {
      setConnected(true);
      setConnecting(false);
      setTerminalLines([
        { type: 'output', content: `Conectando a ${currentInstance.sshConfig!.user}@${currentInstance.sshConfig!.host}...`, timestamp: new Date() },
        { type: 'output', content: 'Conexión establecida.', timestamp: new Date() },
        { type: 'output', content: `Welcome to Ubuntu 22.04.3 LTS`, timestamp: new Date() },
        { type: 'output', content: '', timestamp: new Date() },
      ]);
      notifications.show({
        title: 'Conectado',
        message: `SSH a ${currentInstance.name} establecido`,
        color: 'green',
      });
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setTerminalLines([]);
    notifications.show({
      message: 'Desconectado',
      color: 'yellow',
    });
  };

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      const cmd = currentCommand.trim();
      
      // Add to history
      setCommandHistory([...commandHistory, cmd]);
      setHistoryIndex(-1);
      
      // Add input line
      setTerminalLines((prev) => [
        ...prev,
        { type: 'input', content: `$ ${cmd}`, timestamp: new Date() },
      ]);

      // Simulate command output
      setTimeout(() => {
        let output: TerminalLine[] = [];
        
        if (cmd === 'pwd') {
          output = [{ type: 'output', content: '/home/drdelco', timestamp: new Date() }];
        } else if (cmd === 'whoami') {
          output = [{ type: 'output', content: 'drdelco', timestamp: new Date() }];
        } else if (cmd === 'ls') {
          output = [{ type: 'output', content: 'projects  workspace  .openclaw  .bashrc  .profile', timestamp: new Date() }];
        } else if (cmd === 'ls -la') {
          output = [
            { type: 'output', content: 'total 24', timestamp: new Date() },
            { type: 'output', content: 'drwxr-xr-x 5 drdelco drdelco 4096 Feb 14 10:00 .', timestamp: new Date() },
            { type: 'output', content: 'drwxr-xr-x 3 root    root    4096 Feb  8 12:00 ..', timestamp: new Date() },
            { type: 'output', content: 'drwxr-xr-x 3 drdelco drdelco 4096 Feb 14 10:00 .openclaw', timestamp: new Date() },
            { type: 'output', content: 'drwxr-xr-x 2 drdelco drdelco 4096 Feb 14 09:00 projects', timestamp: new Date() },
            { type: 'output', content: 'drwxr-xr-x 4 drdelco drdelco 4096 Feb 14 10:00 workspace', timestamp: new Date() },
          ];
        } else if (cmd.startsWith('cd ')) {
          output = [{ type: 'output', content: '', timestamp: new Date() }];
        } else if (cmd === 'clear') {
          setTerminalLines([]);
          setCurrentCommand('');
          return;
        } else if (cmd === 'openclaw status') {
          output = [
            { type: 'output', content: '🦞 OpenClaw 2026.2.3-1 (d84eb46)', timestamp: new Date() },
            { type: 'output', content: '✅ Gateway: running (pid 12345)', timestamp: new Date() },
            { type: 'output', content: '📡 Channels: telegram', timestamp: new Date() },
            { type: 'output', content: '🧠 Model: anthropic/claude-opus-4-5', timestamp: new Date() },
          ];
        } else {
          output = [{ type: 'error', content: `bash: ${cmd.split(' ')[0]}: command not found`, timestamp: new Date() }];
        }
        
        setTerminalLines((prev) => [...prev, ...output]);
      }, 100);

      setCurrentCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory') {
      if (file.name === '..') {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        setCurrentPath('/' + parts.join('/') || '/');
      } else {
        setCurrentPath(`${currentPath}/${file.name}`.replace('//', '/'));
      }
      notifications.show({
        message: `Navegando a ${file.name}`,
        color: 'blue',
      });
    } else {
      notifications.show({
        title: 'Archivo seleccionado',
        message: file.name,
        color: 'blue',
      });
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return '—';
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box p="xl" h="100%">
      <Group justify="space-between" mb="lg">
        <Box>
          <Title order={2}>Terminal</Title>
          <Text c="dimmed" mt={4}>
            Acceso SSH y SFTP a tus instancias
          </Text>
        </Box>
        <Group>
          <Select
            value={selectedInstance}
            onChange={(v) => {
              setSelectedInstance(v || '');
              setConnected(false);
              setTerminalLines([]);
            }}
            data={instances.map((i) => ({ 
              value: i.id, 
              label: `${i.emoji || '🤖'} ${i.name}` 
            }))}
            w={200}
          />
          {connected ? (
            <Button color="red" variant="light" onClick={handleDisconnect}>
              Desconectar
            </Button>
          ) : (
            <Button 
              onClick={handleConnect} 
              loading={connecting}
              disabled={!currentInstance?.sshConfig}
            >
              Conectar SSH
            </Button>
          )}
        </Group>
      </Group>

      {currentInstance?.sshConfig && (
        <Code mb="lg">
          ssh {currentInstance.sshConfig.user}@{currentInstance.sshConfig.host}
        </Code>
      )}

      <Tabs value={activeTab} onChange={setActiveTab} h="calc(100% - 120px)">
        <Tabs.List>
          <Tabs.Tab value="terminal" leftSection={<IconTerminal2 size={16} />}>
            Terminal
            {connected && <Badge size="xs" color="green" ml={6}>●</Badge>}
          </Tabs.Tab>
          <Tabs.Tab value="sftp" leftSection={<IconFolder size={16} />}>
            SFTP
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="terminal" h="100%" pt="md">
          <Paper
            h="100%"
            radius="md"
            withBorder
            style={{
              backgroundColor: '#1a1b26',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {connected ? (
              <>
                <ScrollArea
                  style={{ flex: 1 }}
                  p="md"
                  viewportRef={terminalRef}
                >
                  {terminalLines.map((line, i) => (
                    <Text
                      key={i}
                      size="sm"
                      ff="monospace"
                      c={line.type === 'error' ? 'red' : line.type === 'input' ? 'green' : 'gray.4'}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {line.content}
                    </Text>
                  ))}
                </ScrollArea>
                <Group
                  p="md"
                  gap="xs"
                  style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}
                  onClick={() => inputRef.current?.focus()}
                >
                  <Text c="green" ff="monospace" size="sm">$</Text>
                  <TextInput
                    ref={inputRef}
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    onKeyDown={handleCommand}
                    variant="unstyled"
                    placeholder="Escribe un comando..."
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: 'var(--mantine-color-gray-4)',
                      },
                    }}
                  />
                </Group>
              </>
            ) : (
              <Stack align="center" justify="center" h="100%" gap="md">
                <IconTerminal2 size={48} style={{ opacity: 0.5 }} />
                <Text c="dimmed">Conecta a una instancia para usar el terminal</Text>
                <Button onClick={handleConnect} loading={connecting} disabled={!currentInstance?.sshConfig}>
                  Conectar
                </Button>
              </Stack>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="sftp" h="100%" pt="md">
          <Paper h="100%" radius="md" withBorder>
            {/* Path bar */}
            <Group p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
              <Tooltip label="Inicio">
                <ActionIcon variant="subtle" onClick={() => setCurrentPath('/home/drdelco')}>
                  <IconHome size={18} />
                </ActionIcon>
              </Tooltip>
              <Group gap={4}>
                {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
                  <Group key={i} gap={4}>
                    <IconChevronRight size={14} style={{ opacity: 0.5 }} />
                    <Text
                      size="sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setCurrentPath('/' + arr.slice(0, i + 1).join('/'))}
                    >
                      {part}
                    </Text>
                  </Group>
                ))}
              </Group>
              <Box style={{ flex: 1 }} />
              <Tooltip label="Refrescar">
                <ActionIcon variant="subtle">
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Subir archivo">
                <ActionIcon variant="subtle">
                  <IconUpload size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {/* File list */}
            <ScrollArea h="calc(100% - 60px)">
              <Stack gap={0}>
                {files.map((file) => (
                  <Group
                    key={file.name}
                    p="sm"
                    px="md"
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--mantine-color-dark-7)',
                    }}
                    className="file-row"
                    onClick={() => handleFileClick(file)}
                  >
                    {file.type === 'directory' ? (
                      <IconFolder size={18} style={{ color: 'var(--mantine-color-blue-5)' }} />
                    ) : (
                      <IconFile size={18} style={{ opacity: 0.6 }} />
                    )}
                    <Text size="sm" style={{ flex: 1 }}>{file.name}</Text>
                    <Text size="xs" c="dimmed" w={80}>{formatSize(file.size)}</Text>
                    <Text size="xs" c="dimmed" w={100}>{formatDate(file.modified)}</Text>
                    {file.type === 'file' && (
                      <Tooltip label="Descargar">
                        <ActionIcon 
                          variant="subtle" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            notifications.show({ message: `Descargando ${file.name}...`, color: 'blue' });
                          }}
                        >
                          <IconDownload size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                ))}
              </Stack>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
