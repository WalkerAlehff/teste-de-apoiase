'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Share2, Heart, Calendar, User, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ContributionModal } from '@/components/contribution-modal';
import { ShareModal } from '@/components/share-modal';
import { formatCurrency, calculateProgress } from '@/lib/utils';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  description: string;
  images: string[];
  goal: number;
  current: number;
  handle: string;
  userId: string;
  createdAt: string;
  contributions: {
    id: string;
    amount: number;
    contributorName: string;
    createdAt: string;
  }[];
}

export default function CampaignDetails() {
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
      } else {
        console.error('Campaign not found');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando campanha...</p>
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
          <p className="text-gray-600 mb-6">
            A campanha que você procura não existe ou foi removida.
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

  const progress = calculateProgress(campaign.current, campaign.goal);
  const mainImage = campaign.images?.[0] || '/placeholder-campaign.svg';

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
              <h1 className="text-xl font-bold text-gray-900">Apoio Coletivo</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Campaign Image */}
          <div className="relative h-96">
            <Image
              src={mainImage}
              alt={campaign.name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-campaign.svg';
              }}
            />
          </div>

          <div className="p-8">
            {/* Campaign Header */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {campaign.name}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(campaign.createdAt), 'dd/MM/yyyy')}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  @{campaign.handle}
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                {campaign.description}
              </p>
            </div>

            {/* Progress Section */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(campaign.current)}
                  </p>
                  <p className="text-sm text-gray-600">arrecadados</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-medium text-gray-900">
                    {progress}%
                  </p>
                  <p className="text-sm text-gray-600">da meta</p>
                </div>
              </div>

              <Progress value={progress} className="h-3 mb-4" />

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Meta: {formatCurrency(campaign.goal)}
                </div>
                <div>
                  {campaign.contributions.length} contribuiç{campaign.contributions.length === 1 ? 'ão' : 'ões'}
                </div>
              </div>
            </div>

            {/* Contribution Button */}
            <div className="mb-8">
              <Button
                size="lg"
                className="w-full"
                onClick={() => setShowContributionModal(true)}
              >
                <Heart className="h-5 w-5 mr-2" />
                Contribuir com esta campanha
              </Button>
            </div>

            {/* Recent Contributions */}
            {campaign.contributions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contribuições Recentes
                </h2>
                <div className="space-y-3">
                  {campaign.contributions.slice(0, 10).map((contribution) => (
                    <div
                      key={contribution.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <Heart className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {contribution.contributorName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(contribution.createdAt), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(contribution.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showContributionModal && (
        <ContributionModal
          campaign={campaign}
          onClose={() => setShowContributionModal(false)}
          onSuccess={() => {
            setShowContributionModal(false);
            // Refresh campaign data
            fetchCampaign(campaign.id);
          }}
        />
      )}

      {showShareModal && (
        <ShareModal
          campaign={campaign}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}