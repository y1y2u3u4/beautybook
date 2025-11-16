import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBulkEmails } from '@/lib/notifications/email';
import { sendBulkSMS } from '@/lib/notifications/sms';

/**
 * GET /api/campaigns
 * Get campaigns for a provider
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');

    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (status) {
      where.status = status;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        template: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('[API] Failed to fetch campaigns:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns
 * Create and optionally send a campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      providerId,
      createdBy,
      name,
      type,
      subject,
      message,
      templateId,
      targetAudience,
      scheduledFor,
      sendNow,
    } = body;

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        providerId,
        createdBy,
        name,
        type,
        subject,
        message,
        templateId,
        targetAudience,
        status: sendNow ? 'SENDING' : scheduledFor ? 'SCHEDULED' : 'DRAFT',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
    });

    // If send now, get recipients and send
    if (sendNow) {
      // Get recipients based on target audience
      const recipients = await getRecipients(targetAudience, providerId);

      campaign.recipientCount = recipients.length;

      // Send based on type
      if (type === 'EMAIL') {
        const emails = recipients.map(r => ({
          to: r.email,
          subject: subject || 'Message from BeautyBook',
          html: message,
        }));

        const result = await sendBulkEmails(emails);

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            recipientCount: recipients.length,
            sentCount: result.successCount,
          },
        });
      } else if (type === 'SMS') {
        const smsMessages = recipients
          .filter(r => r.phone)
          .map(r => ({
            to: r.phone!,
            message,
          }));

        const result = await sendBulkSMS(smsMessages);

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            recipientCount: smsMessages.length,
            sentCount: result.successCount,
          },
        });
      }
    }

    return NextResponse.json({ campaign });
  } catch (error: any) {
    console.error('[API] Failed to create campaign:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get recipients based on target audience
 */
async function getRecipients(
  targetAudience: any,
  providerId?: string
): Promise<Array<{ email: string; phone?: string }>> {
  const where: any = { role: 'CUSTOMER' };

  // Apply filters from target audience
  if (providerId) {
    where.appointments = {
      some: {
        providerId,
      },
    };
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      email: true,
      customerProfile: {
        select: {
          phone: true,
        },
      },
    },
  });

  return users.map(u => ({
    email: u.email,
    phone: u.customerProfile?.phone ?? undefined,
  }));
}
