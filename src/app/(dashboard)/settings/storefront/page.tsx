'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useStorefront, useUpdateStorefront } from '@/lib/hooks/use-storefront';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Check } from 'lucide-react';

type TemplateName = 'classic' | 'modern' | 'minimal' | 'fashion';

const templates: Array<{
  name: TemplateName;
  displayName: string;
  description: string;
  color: string;
}> = [
  {
    name: 'classic',
    displayName: 'Classic',
    description: 'Template tradicional y versátil para e-commerce',
    color: 'bg-slate-500',
  },
  {
    name: 'modern',
    displayName: 'Modern',
    description: 'Template moderno con diseño full-width y tonos azules',
    color: 'bg-blue-500',
  },
  {
    name: 'minimal',
    displayName: 'Minimal',
    description: 'Template minimalista con diseño limpio y elegante',
    color: 'bg-gray-800',
  },
  {
    name: 'fashion',
    displayName: 'Fashion',
    description: 'Template estilo lookbook con estética editorial premium',
    color: 'bg-amber-600',
  },
];

export default function StorefrontSettingsPage() {
  const { user } = useAuth();
  const { config, isLoading, template: currentTemplate } = useStorefront();
  const updateStorefront = useUpdateStorefront();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName | null>(null);

  const handleSelectTemplate = async (templateName: TemplateName) => {
    if (templateName === currentTemplate) {
      return; // Ya está seleccionado
    }

    setError(null);
    setSuccess(false);
    setSelectedTemplate(templateName);

    try {
      await updateStorefront.mutateAsync({
        theme_config: {
          template: templateName,
        },
      });
      setSuccess(true);
      setSelectedTemplate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el template');
      setSelectedTemplate(null);
    }
  };

  return (
    <RoleGuard allowedRoles={['OWNER']} fallback={<div>No tienes permisos para acceder a esta página</div>}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Storefront</h1>
          <p className="text-muted-foreground mt-2">Selecciona el template para tu tienda en línea</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando configuración...</p>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Templates Disponibles</CardTitle>
              <CardDescription>Elige el diseño que mejor se adapte a tu marca</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 mb-4">
                  Template actualizado exitosamente
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => {
                  const isActive = template.name === currentTemplate;
                  const isUpdating = selectedTemplate === template.name && updateStorefront.isPending;

                  return (
                    <div
                      key={template.name}
                      className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${isUpdating ? 'opacity-50' : ''}`}
                      onClick={() => !isUpdating && handleSelectTemplate(template.name)}
                    >
                      {isActive && (
                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded ${template.color}`} />
                          <div>
                            <h3 className="font-semibold text-lg">{template.displayName}</h3>
                            {isActive && (
                              <p className="text-xs text-muted-foreground">Template activo</p>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{template.description}</p>

                        {isUpdating && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span>Actualizando...</span>
                          </div>
                        )}

                        {!isActive && !isUpdating && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTemplate(template.name);
                            }}
                          >
                            Seleccionar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}

