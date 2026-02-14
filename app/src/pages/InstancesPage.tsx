import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InstanceCard } from '@/components/instances/InstanceCard';
import { useInstanceStore } from '@/stores/instanceStore';
import type { Instance } from '@/types';

// Mock data for development
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
    lastHeartbeat: new Date(Date.now() - 5 * 60 * 1000),
    version: '2026.2.3-1',
    model: 'anthropic/claude-opus-4-5',
    createdAt: new Date('2026-02-08'),
  },
];

export function InstancesPage() {
  const { instances, selectedInstance, selectInstance } = useInstanceStore();
  
  // Use mock data if no instances loaded
  const displayInstances = instances.length > 0 ? instances : mockInstances;
  
  const handleRestart = async (instanceId: string) => {
    console.log('Restarting instance:', instanceId);
    // TODO: Call gateway restart
  };
  
  const handleAddInstance = () => {
    // TODO: Open add instance modal
    console.log('Add instance');
  };
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instancias</h1>
          <p className="text-gray-500 mt-1">Gestiona tus instancias de OpenClaw</p>
        </div>
        <Button onClick={handleAddInstance}>
          <Plus size={18} className="mr-2" />
          Añadir instancia
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayInstances.map((instance) => (
          <InstanceCard
            key={instance.id}
            instance={instance}
            isSelected={selectedInstance?.id === instance.id}
            onSelect={() => selectInstance(instance)}
            onRestart={() => handleRestart(instance.id)}
          />
        ))}
      </div>
      
      {displayInstances.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No hay instancias configuradas</p>
          <Button onClick={handleAddInstance}>
            <Plus size={18} className="mr-2" />
            Añadir tu primera instancia
          </Button>
        </div>
      )}
    </div>
  );
}
