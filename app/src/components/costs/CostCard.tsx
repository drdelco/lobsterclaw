import { Paper, Text, Group, ThemeIcon, Progress, Stack } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface CostCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  color: string;
  progress?: number;
  trend?: {
    value: number;
    label: string;
  };
}

export function CostCard({ title, value, subtitle, icon, color, progress, trend }: CostCardProps) {
  return (
    <Paper p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text size="sm" c="dimmed" fw={500}>{title}</Text>
        <ThemeIcon variant="light" color={color} size="lg" radius="md">
          {icon}
        </ThemeIcon>
      </Group>

      <Stack gap={4}>
        <Text size="xl" fw={700}>{value}</Text>
        
        {subtitle && (
          <Text size="sm" c="dimmed">{subtitle}</Text>
        )}

        {progress !== undefined && (
          <Progress 
            value={progress} 
            color={progress > 90 ? 'red' : progress > 75 ? 'yellow' : color}
            size="sm" 
            mt="xs"
          />
        )}

        {trend && (
          <Group gap={4} mt="xs">
            {trend.value >= 0 ? (
              <IconTrendingUp size={16} color="var(--mantine-color-green-6)" />
            ) : (
              <IconTrendingDown size={16} color="var(--mantine-color-red-6)" />
            )}
            <Text size="xs" c={trend.value >= 0 ? 'green' : 'red'}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </Text>
            <Text size="xs" c="dimmed">{trend.label}</Text>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
