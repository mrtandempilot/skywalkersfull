/**
 * WhatsApp Business API Utilities
 * Handles communication with Meta's WhatsApp Business Platform
 */

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

interface WhatsAppTextMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

interface WhatsAppTemplateMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

interface WhatsAppMediaMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'image' | 'video' | 'document' | 'audio';
  [key: string]: any;
}

/**
 * Send a simple text message via WhatsApp
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  previewUrl: boolean = false
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured');
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = to.replace(/[\s\-\(\)]/g, '');
    
    // Validate phone number format
    if (!isValidWhatsAppNumber(cleanPhone)) {
      throw new Error('Invalid phone number format');
    }

    const payload: WhatsAppTextMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: previewUrl,
        body: message,
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send message',
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a template message via WhatsApp
 * Templates must be pre-approved by Meta
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  parameters: string[],
  languageCode: string = 'en'
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured');
    }

    const cleanPhone = to.replace(/[\s\-\(\)]/g, '');

    if (!isValidWhatsAppNumber(cleanPhone)) {
      throw new Error('Invalid phone number format');
    }

    const payload: WhatsAppTemplateMessage = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: [
          {
            type: 'body',
            parameters: parameters.map((param) => ({
              type: 'text',
              text: param,
            })),
          },
        ],
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp Template Error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send template',
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('Error sending WhatsApp template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a media message (image, video, document, audio)
 */
export async function sendWhatsAppMedia(
  to: string,
  mediaUrl: string,
  mediaType: 'image' | 'video' | 'document' | 'audio',
  caption?: string,
  filename?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured');
    }

    const cleanPhone = to.replace(/[\s\-\(\)]/g, '');

    if (!isValidWhatsAppNumber(cleanPhone)) {
      throw new Error('Invalid phone number format');
    }

    const payload: WhatsAppMediaMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: mediaType,
      [mediaType]: {
        link: mediaUrl,
        ...(caption && { caption }),
        ...(filename && mediaType === 'document' && { filename }),
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp Media Error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send media',
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('Error sending WhatsApp media:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validate WhatsApp phone number format
 * Should be in international format without + (e.g., 14155238886)
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  // Remove any + prefix
  const cleanPhone = phone.replace(/^\+/, '');
  
  // Check if it's a valid international number (7-15 digits)
  return /^\d{7,15}$/.test(cleanPhone);
}

/**
 * Format phone number for WhatsApp (remove + and spaces)
 */
export function formatWhatsAppNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, '');
}

/**
 * Mark message as read
 */
export async function markWhatsAppMessageAsRead(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured');
    }

    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp Mark Read Error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to mark as read',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking message as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get media URL from media ID
 * WhatsApp sends media as IDs that need to be resolved to URLs
 */
export async function getWhatsAppMediaUrl(
  mediaId: string
): Promise<{ url?: string; mimeType?: string; error?: string }> {
  try {
    if (!WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp access token not configured');
    }

    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${mediaId}`,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp Media URL Error:', data);
      return {
        error: data.error?.message || 'Failed to get media URL',
      };
    }

    return {
      url: data.url,
      mimeType: data.mime_type,
    };
  } catch (error) {
    console.error('Error getting media URL:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download media file from WhatsApp
 */
export async function downloadWhatsAppMedia(
  mediaUrl: string
): Promise<{ data?: Buffer; mimeType?: string; error?: string }> {
  try {
    if (!WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp access token not configured');
    }

    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      return {
        error: 'Failed to download media',
      };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type') || undefined;

    return {
      data: buffer,
      mimeType,
    };
  } catch (error) {
    console.error('Error downloading media:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
