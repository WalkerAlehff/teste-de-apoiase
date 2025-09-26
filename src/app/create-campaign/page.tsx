'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Plus, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { useUserData } from '@/hooks/useInfinitepay';

export default function CreateCampaign() {
  const router = useRouter();
  const { userData, isLoading: userLoading } = useUserData();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    handle: userData?.handle || '',
    images: [] as string[]
  });
  
  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) {
      alert('Dados do usuário não carregados. Tente novamente.');
      return;
    }

    if (!formData.name || !formData.description || !formData.goal || !formData.handle) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const goalValue = parseFloat(formData.goal);
    if (isNaN(goalValue) || goalValue <= 0) {
      alert('Por favor, insira uma meta válida.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          goal: goalValue,
          handle: formData.handle,
          userId: userData.id.toString(),
          images: formData.images
        })
      });

      if (response.ok) {
        const campaign = await response.json();
        router.push(`/campaign/${campaign.id}`);
      } else {
        const error = await response.json();
        alert(`Erro ao criar campanha: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Erro ao criar campanha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Criar Nova Campanha</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Conte sua história
            </h2>
            <p className="text-gray-600">
              Compartilhe sua causa e inspire outras pessoas a contribuir com você.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da campanha *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Ajuda para tratamento médico"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.name.length}/100 caracteres
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da campanha *
              </label>
              <Textarea
                id="description"
                placeholder="Conte sua história de forma clara e emocionante. Explique o motivo da campanha, como o dinheiro será usado e por que as pessoas deveriam contribuir."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 caracteres
              </p>
            </div>

            {/* Goal */}
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
                Meta de arrecadação *
              </label>
              <Input
                id="goal"
                type="number"
                step="0.01"
                min="1"
                placeholder="1000.00"
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                required
              />
              {formData.goal && (
                <p className="text-sm text-green-600 mt-1">
                  Meta: {formatCurrency(parseFloat(formData.goal) || 0)}
                </p>
              )}
            </div>

            {/* Handle */}
            <div>
              <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-1">
                Handle que receberá os pagamentos *
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">@</span>
                <Input
                  id="handle"
                  type="text"
                  placeholder="seu-handle"
                  value={formData.handle}
                  onChange={(e) => handleInputChange('handle', e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Este é o handle Infinitepay que receberá as contribuições.
              </p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagens da campanha
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Adicione URLs de imagens que representem sua campanha.
              </p>
              
              <div className="flex gap-2 mb-3">
                <Input
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImage}
                  disabled={!imageInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                        {image}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Link href="/" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Criar Campanha
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}