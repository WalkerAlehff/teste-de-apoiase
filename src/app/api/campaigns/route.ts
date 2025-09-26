import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
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
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        images: JSON.stringify(data.images || []),
        goal: parseFloat(data.goal),
        handle: data.handle,
        userId: data.userId,
        checkoutUrl: data.checkoutUrl
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}