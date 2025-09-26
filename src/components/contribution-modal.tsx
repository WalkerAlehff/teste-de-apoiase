'use client';

import { useState } from 'react';
import { Heart, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { processCheckoutPayment } from '@/lib/infinitepay';
import { useInfinitepayApi } from '@/hooks/useInfinitepay';

interface Campaign {
  id: string;
  name: string;
  handle: string;
}

interface ContributionModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContributionModal({ campaign, onClose, onSuccess }: ContributionModalProps) {
  const [amount, setAmount] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { executeApiCall } = useInfinitepayApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !contributorName || !contributorEmail) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    setLoading(true);

    try {
      // First, create a pending contribution in the database
      const contributionResponse = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: contributionAmount,
          contributorName,
          contributorEmail
        })
      });

      if (!contributionResponse.ok) {
        throw new Error('Failed to create contribution');
      }

      const contribution = await contributionResponse.json();

      // Process payment with Infinitepay
      const paymentResult = await executeApiCall(() =>
        processCheckoutPayment(
          [{
            quantity: 1,
            priceInReais: contributionAmount,
            description: `Contribuição para: ${campaign.name}`
          }],
          campaign.handle,
          {
            name: contributorName,
            email: contributorEmail
          }
        )
      );

      // Update contribution status
      await fetch(`/api/contributions/${contribution.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          transactionNsu: paymentResult.transactionNsu
        })
      });

      // Redirect to success page
      window.location.href = `/success?contribution=${contribution.id}`;
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Falha no pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            Contribuir com a campanha
          </DialogTitle>
          <DialogDescription>
            {campaign.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da contribuição
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={amount === quickAmount.toString() ? 'bg-blue-50 border-blue-300' : ''}
                >
                  {formatCurrency(quickAmount)}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              step="0.01"
              min="1"
              placeholder="Ou digite outro valor"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Contributor Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seu nome *
            </label>
            <Input
              type="text"
              placeholder="Como você gostaria de aparecer"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seu email *
            </label>
            <Input
              type="email"
              placeholder="Para contato e confirmação"
              value={contributorEmail}
              onChange={(e) => setContributorEmail(e.target.value)}
              required
            />
          </div>

          {/* Summary */}
          {amount && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total a contribuir:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(parseFloat(amount) || 0)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Contribuir
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}