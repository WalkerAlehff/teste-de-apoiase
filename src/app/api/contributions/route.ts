import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const contribution = await prisma.contribution.create({
      data: {
        campaignId: data.campaignId,
        amount: parseFloat(data.amount),
        contributorName: data.contributorName,
        contributorEmail: data.contributorEmail,
        status: 'pending'
      }
    });

    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    );
  }
}