import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: params.id
      },
      include: {
        contributions: {
          where: {
            status: 'completed'
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Calculate current amount
    const current = campaign.contributions.reduce((sum, contrib) => sum + contrib.amount, 0);

    const campaignWithAmount = {
      ...campaign,
      current,
      images: JSON.parse(campaign.images || '[]')
    };

    return NextResponse.json(campaignWithAmount);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const campaign = await prisma.campaign.update({
      where: {
        id: params.id
      },
      data: {
        name: data.name,
        description: data.description,
        images: JSON.stringify(data.images || []),
        goal: parseFloat(data.goal),
        handle: data.handle
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}