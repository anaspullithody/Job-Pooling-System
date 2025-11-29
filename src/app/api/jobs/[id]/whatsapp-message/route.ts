import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';

// GET /api/jobs/[id]/whatsapp-message - Get formatted WhatsApp message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrAccountant();

    const { id } = await params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        client: true,
        supplier: true
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Format WhatsApp message
    const message = `📋 *Job Details*

👤 *Guest:* ${job.guestName}
📞 *Contact:* ${job.guestContact}

📍 *Pickup:* ${job.pickup}
📍 *Drop:* ${job.drop}
${job.flight ? `✈️ *Flight:* ${job.flight}\n` : ''}

${job.category ? `🚗 *Category:* ${job.category}\n` : ''}
${job.vehicle ? `🚙 *Vehicle:* ${job.vehicle}\n` : ''}
${job.driverName ? `👨‍✈️ *Driver:* ${job.driverName}\n` : ''}
${job.assignedPlate ? `🔢 *Plate:* ${job.assignedPlate}\n` : ''}

💰 *Price:* ${job.price ? `AED ${job.price}` : 'N/A'}
${job.taxAmount ? `📊 *Tax:* AED ${job.taxAmount}\n` : ''}
${job.totalAmount ? `💵 *Total:* AED ${job.totalAmount}\n` : ''}

📊 *Status:* ${job.status}
${job.client ? `🏢 *Client:* ${job.client.name}\n` : ''}
${job.supplier ? `🚚 *Supplier:* ${job.supplier.name}\n` : ''}

_Generated on ${new Date().toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })}_`;

    return NextResponse.json({ message });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error generating WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
