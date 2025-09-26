'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Heart } from 'lucide-react';
import { CampaignCard } from '@/components/campaign-card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useInfinitepay';

interface Campaign {
  id: string;
  name: string;
  description: string;
  images: string[];
  goal: number;
  current: number;
  createdAt: string;
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, isLoading: userLoading } = useUserData();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Apoio Coletivo</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {userData && (
                <span className="text-sm text-gray-600">
                  Olá, {userData.name}!
                </span>
              )}
              <Link href="/create-campaign">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Campanha
                </Button>
              </Link>
              <Link href="/my-campaigns">
                <Button variant="outline">
                  Minhas Campanhas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Campanhas de Apoio Abertas
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra causas importantes e contribua para fazer a diferença na vida das pessoas.
            Cada doação conta e juntos podemos alcançar grandes objetivos!
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma campanha encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              Seja o primeiro a criar uma campanha e compartilhar sua causa!
            </p>
            <Link href="/create-campaign">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira campanha
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
