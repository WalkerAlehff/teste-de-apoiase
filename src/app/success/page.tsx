'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Heart, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface Contribution {
  id: string;
  amount: number;
  contributorName: string;
  contributorEmail: string;
  status: string;
  createdAt: string;
  campaign: {
    id: string;
    name: string;
    description: string;
    current: number;
    goal: number;
  };
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const contributionId = searchParams.get('contribution');
    if (contributionId) {
      fetchContribution(contributionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchContribution = async (id: string) => {
    try {
      const response = await fetch(`/api/contributions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContribution(data);
      }
    } catch (error) {
      console.error('Error fetching contribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareContribution = () => {
    if (!contribution) return;
    
    const shareText = `Acabei de contribuir com ${formatCurrency(contribution.amount)} para a campanha "${contribution.campaign.name}". Junte-se a mim e faça a diferença!`;
    const campaignUrl = `${window.location.origin}/campaign/${contribution.campaign.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Contribuição realizada!',
        text: shareText,
        url: campaignUrl,
      }).catch(console.error);
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${shareText} ${campaignUrl}`);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Contribuição não encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            Não foi possível encontrar os dados da contribuição.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para início
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
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Apoio Coletivo</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Contribuição realizada com sucesso!
            </h1>
            <p className="text-gray-600">
              Obrigado por fazer parte desta causa!
            </p>
          </div>

          {/* Contribution Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor contribuído:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(contribution.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Contribuidor:</span>
                <span className="font-medium text-gray-900">
                  {contribution.contributorName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Campanha:</span>
                <span className="font-medium text-gray-900">
                  {contribution.campaign.name}
                </span>
              </div>
            </div>
          </div>

          {/* Campaign Progress */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Progresso da campanha
            </h2>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatCurrency(contribution.campaign.current)}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              de {formatCurrency(contribution.campaign.goal)} arrecadados
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((contribution.campaign.current / contribution.campaign.goal) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={shareContribution}
              className="w-full"
              size="lg"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Compartilhar minha contribuição
            </Button>

            <div className="flex gap-3">
              <Link href={`/campaign/${contribution.campaign.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Ver campanha
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Explorar campanhas
                </Button>
              </Link>
            </div>
          </div>

          {/* Thank you message */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Heart className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-yellow-800 font-medium">
              Sua generosidade faz a diferença na vida de muitas pessoas. 
              Obrigado por acreditar nesta causa!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}