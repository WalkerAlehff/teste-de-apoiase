import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: params.userId
      },
      include: {
        contributions: {
          where: {
            status: 'completed'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate current amount for each campaign
    const campaignsWithAmount = campaigns.map(campaign => ({
      ...campaign,
      current: campaign.contributions.reduce((sum, contrib) => sum + contrib.amount, 0),
      images: JSON.parse(campaign.images || '[]')
    }));

    return NextResponse.json(campaignsWithAmount);
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}