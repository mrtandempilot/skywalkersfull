import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendWhatsAppMessage, sendWhatsAppTemplate, sendWhatsAppMedia } from '@/lib/whatsapp';

/**
 * POST - Send WhatsApp messages (text, template, or media)
 * This endpoint can be used by admins or system to send messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, type = 'text', templateName, templateParams, mediaUrl, mediaType, caption, filename } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Recipient phone number is required' },
        { status: 400 }
      );
    }

    let result;
    const sessionId = `whatsapp_${to}`;

    // Send based on message type
    switch (type) {
      case 'text':
        if (!message) {
          return NextResponse.json(
            { error: 'Message is required for text type' },
            { status: 400 }
          );
        }
        result = await sendWhatsAppMessage(to, message);
        break;

      case 'template':
        if (!templateName || !templateParams) {
          return NextResponse.json(
            { error: 'Template name and parameters are required for template type' },
            { status: 400 }
          );
        }
        result = await sendWhatsAppTemplate(to, templateName, templateParams);
        break;

      case 'media':
        if (!mediaUrl || !mediaType) {
          return NextResponse.json(
            { error: 'Media URL and type are required for media type' },
            { status: 400 }
          );
        }
        result = await sendWhatsAppMedia(to, mediaUrl, mediaType, caption, filename);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid message type. Use: text, template, or media' },
          { status: 400 }
        );
    }

    // Check if send was successful
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      );
    }

    // Save sent message to database
    try {
      const messageContent = type === 'text' ? message : 
                            type === 'template' ? `[Template: ${templateName}]` :
                            caption || `[${mediaType}]`;

      await supabaseAdmin.from('conversations').insert({
        session_id: sessionId,
        channel: 'whatsapp',
        whatsapp_message_id: result.messageId,
        whatsapp_phone_number: to,
        message: messageContent,
        sender: 'bot',
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        created_at: new Date().toISOString(),
      });

      console.log('✅ Sent message saved to database');
    } catch (dbError) {
      console.error('❌ Error saving sent message to database:', dbError);
      // Don't fail the request if database save fails
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      to,
      type,
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}
