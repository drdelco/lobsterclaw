import { useState } from 'react';
import { Box, Title, Text, Paper, Group, Textarea, Button, Badge, Stack, ActionIcon, Tooltip, Select, Code } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFileText, IconDeviceFloppy, IconRefresh, IconCopy, IconCheck } from '@tabler/icons-react';
import { useClipboard } from '@mantine/hooks';
import type { Instance, ConfigFile, ConfigFileName } from '@/types';

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
  },
];

const mockConfigFiles: Record<string, ConfigFile[]> = {
  alvi: [
    {
      name: 'SOUL.md',
      path: '/home/drdelco/.openclaw/workspace/SOUL.md',
      content: `# SOUL.md — Alvi

## Identidad

Soy Alvi, el asistente de NG y Diego, su CEO. Soy un agente de inteligencia artificial al servicio de la familia de Diego y de su empresa médica, NG Clínicas.

## Personalidad

- Profesional, eficiente, directo y cercano
- Hablo siempre en español salvo que me hablen en otro idioma
- Trato de usted a los pacientes y de tú a la familia`,
      lastModified: new Date(Date.now() - 3600000),
    },
    {
      name: 'MEMORY.md',
      path: '/home/drdelco/.openclaw/workspace/MEMORY.md',
      content: `# MEMORY.md — Memoria del agente

## Contexto de NG Clínicas

* Clínica privada de neurocirugía de columna en España
* Diego es el cirujano principal y CEO
* Sistemas: SaluFirst, SaluFact, SaluFile, SaluHold

## Stack tecnológico

* Frontend: React + TypeScript
* Backend: Firebase Functions
* Base de datos: Firestore`,
      lastModified: new Date(Date.now() - 7200000),
    },
    {
      name: 'USER.md',
      path: '/home/drdelco/.openclaw/workspace/USER.md',
      content: `# USER.md — Información sobre los usuarios

## Diego (Admin)

* Profesión: Neurocirujano
* Rol: CEO de NG Clínicas
* Ubicación: Elche, Alicante, España
* Idioma: Español (nativo), Inglés (profesional)`,
      lastModified: new Date(Date.now() - 86400000),
    },
    {
      name: 'HEARTBEAT.md',
      path: '/home/drdelco/.openclaw/workspace/HEARTBEAT.md',
      content: `# HEARTBEAT.md - Tareas periódicas

## Revisión de emails de Diego
- Revisar diegoferrandezsempere@gmail.com cada día
- Alertar sobre emails urgentes
- Clasificar: 🔴 Urgente / 🟡 Importante / 🟢 Rutina`,
      lastModified: new Date(Date.now() - 172800000),
    },
    {
      name: 'AGENTS.md',
      path: '/home/drdelco/.openclaw/workspace/AGENTS.md',
      content: `# AGENTS.md - Your Workspace

This folder is home. Treat it that way.

## Every Session

Before doing anything else:
1. Read SOUL.md — this is who you are
2. Read USER.md — this is who you're helping
3. Read memory/YYYY-MM-DD.md for recent context`,
      lastModified: new Date(Date.now() - 259200000),
    },
  ],
};

const configFileDescriptions: Record<ConfigFileName, string> = {
  'SOUL.md': 'Personalidad y comportamiento del agente',
  'MEMORY.md': 'Memoria a largo plazo y contexto',
  'USER.md': 'Información sobre los usuarios',
  'AGENTS.md': 'Instrucciones de workspace',
  'HEARTBEAT.md': 'Tareas periódicas automáticas',
  'TOOLS.md': 'Notas sobre herramientas',
  'IDENTITY.md': 'Identidad básica del agente',
};

export function ConfigPage() {
  const [selectedInstance, setSelectedInstance] = useState<string>(mockInstances[0]?.id || '');
  const [activeFile, setActiveFile] = useState<string>('SOUL.md');
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const clipboard = useClipboard();

  const instances = mockInstances;
  const configFiles = mockConfigFiles[selectedInstance] || [];
  const currentFile = configFiles.find((f) => f.name === activeFile);
  
  const currentContent = editedContent[activeFile] ?? currentFile?.content ?? '';
  const hasChanges = currentFile && editedContent[activeFile] !== undefined && editedContent[activeFile] !== currentFile.content;

  const handleContentChange = (content: string) => {
    setEditedContent({ ...editedContent, [activeFile]: content });
  };

  const handleSave = async () => {
    if (!currentFile || !hasChanges) return;
    
    setSaving(true);
    
    // Simulate save
    setTimeout(() => {
      notifications.show({
        title: 'Guardado',
        message: `${activeFile} ha sido actualizado`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      // Clear edited state for this file
      const newEdited = { ...editedContent };
      delete newEdited[activeFile];
      setEditedContent(newEdited);
      
      setSaving(false);
    }, 500);
  };

  const handleRevert = () => {
    if (!currentFile) return;
    
    const newEdited = { ...editedContent };
    delete newEdited[activeFile];
    setEditedContent(newEdited);
    
    notifications.show({
      message: 'Cambios descartados',
      color: 'yellow',
    });
  };

  const handleCopy = () => {
    clipboard.copy(currentContent);
    notifications.show({
      message: 'Copiado al portapapeles',
      color: 'blue',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2}>Configuración</Title>
          <Text c="dimmed" mt={4}>
            Edita los archivos de configuración de tus instancias
          </Text>
        </Box>
        <Select
          value={selectedInstance}
          onChange={(v) => {
            setSelectedInstance(v || '');
            setEditedContent({});
          }}
          data={instances.map((i) => ({ 
            value: i.id, 
            label: `${i.emoji || '🤖'} ${i.name}` 
          }))}
          w={200}
        />
      </Group>

      <Group align="flex-start" gap="lg">
        {/* File tabs on the left */}
        <Paper w={200} radius="md" withBorder p="xs">
          <Stack gap={4}>
            {configFiles.map((file) => {
              const fileHasChanges = editedContent[file.name] !== undefined && editedContent[file.name] !== file.content;
              return (
                <Button
                  key={file.name}
                  variant={activeFile === file.name ? 'filled' : 'subtle'}
                  justify="space-between"
                  fullWidth
                  onClick={() => setActiveFile(file.name)}
                  rightSection={fileHasChanges && <Badge size="xs" color="yellow">•</Badge>}
                >
                  <Group gap={6}>
                    <IconFileText size={14} />
                    <Text size="sm">{file.name}</Text>
                  </Group>
                </Button>
              );
            })}
          </Stack>
        </Paper>

        {/* Editor */}
        <Paper style={{ flex: 1 }} radius="md" withBorder>
          {currentFile ? (
            <>
              {/* Header */}
              <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
                <Box>
                  <Group gap="xs">
                    <Text fw={600}>{currentFile.name}</Text>
                    {hasChanges && <Badge color="yellow" size="sm">Sin guardar</Badge>}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {configFileDescriptions[currentFile.name as ConfigFileName] || 'Archivo de configuración'}
                  </Text>
                </Box>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    Modificado: {formatDate(currentFile.lastModified)}
                  </Text>
                  <Tooltip label="Copiar contenido">
                    <ActionIcon variant="subtle" onClick={handleCopy}>
                      <IconCopy size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>

              {/* Editor area */}
              <Box p="md">
                <Textarea
                  value={currentContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  minRows={20}
                  maxRows={30}
                  autosize
                  styles={{
                    input: {
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      backgroundColor: 'var(--mantine-color-dark-7)',
                    },
                  }}
                />
              </Box>

              {/* Footer */}
              <Group justify="space-between" p="md" style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}>
                <Group gap="xs">
                  <Code>{currentFile.path}</Code>
                </Group>
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    leftSection={<IconRefresh size={16} />}
                    onClick={handleRevert}
                    disabled={!hasChanges}
                  >
                    Descartar
                  </Button>
                  <Button
                    leftSection={<IconDeviceFloppy size={16} />}
                    onClick={handleSave}
                    disabled={!hasChanges}
                    loading={saving}
                  >
                    Guardar
                  </Button>
                </Group>
              </Group>
            </>
          ) : (
            <Stack align="center" justify="center" h={400} gap="md">
              <IconFileText size={48} style={{ opacity: 0.5 }} />
              <Text c="dimmed">Selecciona un archivo para editar</Text>
            </Stack>
          )}
        </Paper>
      </Group>
    </Box>
  );
}
