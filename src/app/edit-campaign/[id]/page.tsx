'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { useUserData } from '@/hooks/useInfinitepay';

interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  handle: string;
  images: string[];
  userId: string;
}

export default function EditCampaign() {
  const params = useParams();
  const router = useRouter();
  const { userData, isLoading: userLoading } = useUserData();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    handle: '',
    images: [] as string[]
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCampaign(params.id as string);
    }
  }, [params.id]);

  const fetchCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
        setFormData({
          name: data.name,
          description: data.description,
          goal: data.goal.toString(),
          handle: data.handle,
          images: data.images || []
        });
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

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

    if (!campaign || !userData) return;

    // Check if user owns this campaign
    if (campaign.userId !== userData.id.toString()) {
      alert('Você não tem permissão para editar esta campanha.');
      return;
    }

    const goalValue = parseFloat(formData.goal);
    if (isNaN(goalValue) || goalValue <= 0) {
      alert('Por favor, insira uma meta válida.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          goal: goalValue,
          handle: formData.handle,
          images: formData.images
        })
      });

      if (response.ok) {
        router.push(`/campaign/${campaign.id}`);
      } else {
        const error = await response.json();
        alert(`Erro ao atualizar campanha: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Erro ao atualizar campanha. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Campanha não encontrada
          </h1>
          <Link href="/my-campaigns">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para campanhas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check permissions
  if (userData && campaign.userId !== userData.id.toString()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso negado
          </h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para editar esta campanha.
          </p>
          <Link href="/my-campaigns">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para campanhas
            </Button>
          </Link>
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
            <Link href={`/campaign/${campaign.id}`} className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Editar Campanha</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da campanha *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da campanha *
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                required
                maxLength={1000}
              />
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
                  value={formData.handle}
                  onChange={(e) => handleInputChange('handle', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagens da campanha
              </label>
              
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
              <Link href={`/campaign/${campaign.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Salvar Alterações
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