'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

interface ProductImageUploadProps {
  imageUrl?: string;
  onImageChange: (url: string) => void;
  disabled?: boolean;
}

export function ProductImageUpload({ imageUrl, onImageChange, disabled }: ProductImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(imageUrl || null);

  useEffect(() => {
    if (imageUrl !== undefined) {
      setPreview(imageUrl || null);
    }
  }, [imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // En producción, aquí se subiría el archivo a un servicio de almacenamiento
      // Por ahora, solo mostramos un preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      setPreview(url);
      onImageChange(url);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label>Imagen del Producto</Label>

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-contain border rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Sube una imagen o ingresa una URL
              </p>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={disabled}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button type="button" variant="outline" asChild disabled={disabled}>
                    <span>Seleccionar Archivo</span>
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground">o</p>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onChange={handleUrlChange}
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

