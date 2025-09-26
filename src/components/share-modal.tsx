'use client';

import { useState } from 'react';
import { Copy, Share2, Facebook, Twitter, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Campaign {
  id: string;
  name: string;
  description: string;
}

interface ShareModalProps {
  campaign: Campaign;
  onClose: () => void;
}

export function ShareModal({ campaign, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const campaignUrl = `${window.location.origin}/campaign/${campaign.id}`;
  const shareText = `Ajude a apoiar: ${campaign.name}. ${campaign.description.substring(0, 100)}...`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${campaignUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      action: shareOnFacebook,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: shareOnTwitter,
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: shareOnWhatsApp,
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="h-5 w-5 text-blue-600 mr-2" />
            Compartilhar campanha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campaign Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">
              {campaign.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {campaign.description}
            </p>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link da campanha
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={campaignUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-1">
                Link copiado para a área de transferência!
              </p>
            )}
          </div>

          {/* Social Share Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compartilhar nas redes sociais
            </label>
            <div className="grid grid-cols-3 gap-2">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.name}
                    onClick={option.action}
                    className={`${option.color} text-white flex flex-col items-center gap-1 h-16`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{option.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}