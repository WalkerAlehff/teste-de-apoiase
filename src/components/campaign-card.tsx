'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, calculateProgress } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  description: string;
  images: string[];
  goal: number;
  current: number;
  createdAt: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = calculateProgress(campaign.current, campaign.goal);
  const mainImage = campaign.images?.[0] || '/placeholder-campaign.svg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
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
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {campaign.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {campaign.description}
        </p>
        
        <div className="mb-4">
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {formatCurrency(campaign.current)} arrecadados
            </span>
            <span className="font-medium text-gray-900">
              {progress}%
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Meta: {formatCurrency(campaign.goal)}
          </div>
        </div>
        
        <Link href={`/campaign/${campaign.id}`}>
          <Button className="w-full">
            Saber mais
          </Button>
        </Link>
      </div>
    </div>
  );
}