import { Activity, Clock, Cpu, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Instance } from '@/types';

interface InstanceCardProps {
  instance: Instance;
  isSelected: boolean;
  onSelect: () => void;
  onRestart: () => void;
}

export function InstanceCard({ instance, isSelected, onSelect, onRestart }: InstanceCardProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    error: 'bg-red-500',
  };
  
  const locationLabels = {
    gcloud: 'Google Cloud',
    local: 'Local',
    vps: 'VPS',
  };
  
  const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `hace ${seconds}s`;
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    return `hace ${Math.floor(seconds / 86400)}d`;
  };
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{instance.emoji || '🤖'}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {instance.name}
              </h3>
              <p className="text-sm text-gray-500">{locationLabels[instance.location]}</p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${statusColors[instance.status]}`} />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Activity size={14} />
            <span>{instance.version}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Cpu size={14} />
            <span className="truncate">{instance.model.split('/').pop()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
            <Clock size={14} />
            <span>Heartbeat: {timeSince(instance.lastHeartbeat)}</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRestart();
            }}
          >
            <RefreshCw size={14} className="mr-1" />
            Restart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
