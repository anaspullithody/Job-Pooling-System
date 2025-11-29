import { JobStatus } from '@/types/job';

interface WhatsAppJobData {
  guestName: string;
  guestContact: string;
  pickup: string;
  pickupTime?: string | null;
  drop: string;
  flight?: string | null;
  driverName?: string | null;
  assignedPlate?: string | null;
  vehicleModel?: string | null;
}

/**
 * Format a WhatsApp message for an assigned job
 * Includes driver-relevant information for easy communication
 */
export function formatWhatsAppMessage(job: WhatsAppJobData): string {
  const lines: string[] = [];

  lines.push('🚗 *New Job Assignment*');
  lines.push('');

  // Guest Information
  lines.push(`👤 *Guest:* ${job.guestName}`);
  lines.push(`📞 *Contact:* ${job.guestContact}`);
  lines.push('');

  // Pickup Details
  lines.push(`📍 *Pickup:* ${job.pickup}`);
  if (job.pickupTime) {
    lines.push(`🕐 *Time:* ${job.pickupTime}`);
  }

  if (job.flight) {
    lines.push(`✈️ *Flight:* ${job.flight}`);
  }
  lines.push('');

  // Drop Location
  lines.push(`🏁 *Drop:* ${job.drop}`);
  lines.push('');

  // Vehicle/Driver Info
  if (job.driverName) {
    lines.push(`👨‍✈️ *Driver:* ${job.driverName}`);
  }
  if (job.assignedPlate) {
    lines.push(`🚙 *Vehicle:* ${job.assignedPlate}`);
  }
  if (job.vehicleModel) {
    lines.push(`🚗 *Model:* ${job.vehicleModel}`);
  }

  return lines.join('\n');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}
