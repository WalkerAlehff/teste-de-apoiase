'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, Plus, Edit, Users, Target, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, calculateProgress } from '@/lib/utils';
import { useUserData } from '@/hooks/useInfinitepay';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  description: string;
  images: string[];
  goal: number;
  current: number;
  createdAt: string;
  contributions: {
    id: string;
    amount: number;
    contributorName: string;
    createdAt: string;
  }[];
}

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, isLoading: userLoading } = useUserData();

  useEffect(() => {
    const loadCampaigns = async () => {
      if (!userData) return;
      
      try {
        const response = await fetch(`/api/campaigns/user/${userData.id}`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data);
        }
      } catch (error) {
        console.error('Error fetching user campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userData && !userLoading) {
      loadCampaigns();
    }
  }, [userData, userLoading]);


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

  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.current, 0);
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0);
  const totalContributions = campaigns.reduce((sum, campaign) => sum + campaign.contributions.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">Minhas Campanhas</h1>
              </div>
            </div>
            
            <Link href="/create-campaign">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Campanhas</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Arrecadado</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRaised)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Contribuições</p>
                <p className="text-2xl font-bold text-gray-900">{totalContributions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Meta Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGoal)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma campanha criada ainda
            </h3>
            <p className="text-gray-600 mb-4">
              Crie sua primeira campanha e comece a arrecadar fundos para sua causa!
            </p>
            <Link href="/create-campaign">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira campanha
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Suas Campanhas ({campaigns.length})
            </h2>
            
            <div className="grid gap-6">
              {campaigns.map((campaign) => {
                const progress = calculateProgress(campaign.current, campaign.goal);
                const mainImage = campaign.images?.[0];

                return (
                  <div key={campaign.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="md:flex">
                      {/* Image */}
                      {mainImage && (
                        <div className="md:w-48 h-32 md:h-auto relative">
                          <Image
                            src={mainImage}
                            alt={campaign.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 mr-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {campaign.name}
                            </h3>
                            <p className="text-gray-600 line-clamp-2 mb-3">
                              {campaign.description}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              Criada em {format(new Date(campaign.createdAt), 'dd/MM/yyyy')}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link href={`/edit-campaign/${campaign.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            </Link>
                            <Link href={`/campaign/${campaign.id}`}>
                              <Button size="sm">
                                Ver campanha
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <Progress value={progress} className="h-2 mb-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {formatCurrency(campaign.current)} de {formatCurrency(campaign.goal)}
                            </span>
                            <span className="font-medium text-gray-900">
                              {progress}%
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {campaign.contributions.length} contribuiç{campaign.contributions.length === 1 ? 'ão' : 'ões'}
                          </div>
                          {campaign.contributions.length > 0 && (
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Última: {format(
                                new Date(campaign.contributions[0].createdAt), 
                                'dd/MM/yyyy', 
                              )}
                            </div>
                          )}
                        </div>

                        {/* Recent Contributors */}
                        {campaign.contributions.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Contribuições recentes:
                            </h4>
                            <div className="space-y-1">
                              {campaign.contributions.slice(0, 3).map((contribution) => (
                                <div key={contribution.id} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">{contribution.contributorName}</span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(contribution.amount)}
                                  </span>
                                </div>
                              ))}
                              {campaign.contributions.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{campaign.contributions.length - 3} outras contribuições
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}