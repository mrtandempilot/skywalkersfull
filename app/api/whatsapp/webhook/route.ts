import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendWhatsAppMessage, markWhatsAppMessageAsRead, getWhatsAppMediaUrl } from '@/lib/whatsapp';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://mvt36n7e.rpcld.com/webhook/a487d0ab-c749-4703-9125-93e88642d355/chat';

/**
 * GET - Webhook verification endpoint
 * Meta will send a GET request to verify the webhook
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('📞 WhatsApp webhook verification request:', { mode, token });

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        console.log('✅ WhatsApp webhook verified successfully');
        // Respond with 200 OK and challenge token from the request
        return new NextResponse(challenge, { status: 200 });
      } else {
        console.error('❌ Webhook verification failed - invalid token');
        // Responds with '403 Forbidden' if verify tokens do not match
        return NextResponse.json(
          { error: 'Verification failed' },
          { status: 403 }
        );
      }
    }

    console.error('❌ Webhook verification failed - missing parameters');
    return NextResponse.json(
      { error: 'Missing verification parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in webhook verification:', error);
    return NextResponse.json(
      { error: 'Webhook verification error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Receive incoming WhatsApp messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Check if this is a status update or message
    if (body.entry?.[0]?.changes?.[0]?.value) {
      const value = body.entry[0].changes[0].value;

      // Handle status updates (message delivered, read, etc.)
      if (value.statuses) {
        console.log('📊 Message status update:', value.statuses);
        // You can update message status in database here if needed
        return NextResponse.json({ success: true });
      }

      // Handle incoming messages
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const contact = value.contacts?.[0];
        
        console.log('💬 Processing WhatsApp message:', {
          from: message.from,
          type: message.type,
          messageId: message.id,
        });

        // Mark message as read
        await markWhatsAppMessageAsRead(message.id);

        // Process different message types
        await handleIncomingMessage(message, contact);
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error processing WhatsApp webhook:', error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ success: true });
  }
}

/**
 * Handle different types of incoming WhatsApp messages
 */
async function handleIncomingMessage(message: any, contact: any) {
  try {
    const phoneNumber = message.from;
    const profileName = contact?.profile?.name || 'Unknown';
    const sessionId = `whatsapp_${phoneNumber}`;
    
    let messageText = '';
    let mediaUrl = null;
    let mediaType = null;

    // Extract message content based on type
    switch (message.type) {
      case 'text':
        messageText = message.text.body;
        break;
      
      case 'image':
        messageText = message.image.caption || '[Image]';
        if (message.image.id) {
          const mediaData = await getWhatsAppMediaUrl(message.image.id);
          mediaUrl = mediaData.url || null;
          mediaType = 'image';
        }
        break;
      
      case 'video':
        messageText = message.video.caption || '[Video]';
        if (message.video.id) {
          const mediaData = await getWhatsAppMediaUrl(message.video.id);
          mediaUrl = mediaData.url || null;
          mediaType = 'video';
        }
        break;
      
      case 'document':
        messageText = message.document.filename || '[Document]';
        if (message.document.id) {
          const mediaData = await getWhatsAppMediaUrl(message.document.id);
          mediaUrl = mediaData.url || null;
          mediaType = 'document';
        }
        break;
      
      case 'audio':
        messageText = '[Audio message]';
        if (message.audio.id) {
          const mediaData = await getWhatsAppMediaUrl(message.audio.id);
          mediaUrl = mediaData.url || null;
          mediaType = 'audio';
        }
        break;
      
      case 'location':
        messageText = `[Location: ${message.location.latitude}, ${message.location.longitude}]`;
        break;
      
      default:
        messageText = `[Unsupported message type: ${message.type}]`;
        console.log('⚠️ Unsupported message type:', message.type);
    }

    // Save user message to database
    const { error: dbError } = await supabaseAdmin.from('conversations').insert({
      session_id: sessionId,
      channel: 'whatsapp',
      whatsapp_message_id: message.id,
      whatsapp_phone_number: phoneNumber,
      whatsapp_profile_name: profileName,
      message: messageText,
      sender: 'user',
      media_url: mediaUrl,
      media_type: mediaType,
      created_at: new Date(message.timestamp * 1000).toISOString(),
    });

    if (dbError) {
      console.error('❌ Database error saving WhatsApp message:', dbError);
    } else {
      console.log('✅ WhatsApp message saved to database');
    }

    // Don't send automated responses to media-only messages without text
    if (message.type !== 'text' && !message[message.type]?.caption) {
      console.log('ℹ️ Skipping bot response for media-only message');
      return;
    }

    // Send to n8n chatbot for AI response
    try {
      const chatbotResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: messageText,
          sessionId: sessionId,
          channel: 'whatsapp',
          customerName: profileName,
          customerPhone: phoneNumber,
        }),
      });

      if (chatbotResponse.ok) {
        const data = await chatbotResponse.json();
        const botReply = data.output || data.response || data.message;

        if (botReply) {
          // Send reply via WhatsApp
          const result = await sendWhatsAppMessage(phoneNumber, botReply);

          if (result.success) {
            console.log('✅ Bot response sent via WhatsApp');

            // Save bot response to database
            await supabaseAdmin.from('conversations').insert({
              session_id: sessionId,
              channel: 'whatsapp',
              whatsapp_message_id: result.messageId,
              whatsapp_phone_number: phoneNumber,
              whatsapp_profile_name: profileName,
              message: botReply,
              sender: 'bot',
              created_at: new Date().toISOString(),
            });
          } else {
            console.error('❌ Failed to send WhatsApp response:', result.error);
          }
        }
      } else {
        console.error('❌ Chatbot response error:', await chatbotResponse.text());
      }
    } catch (chatbotError) {
      console.error('❌ Error calling chatbot:', chatbotError);
      
      // Send a fallback message
      await sendWhatsAppMessage(
        phoneNumber,
        "Thank you for your message! We'll get back to you shortly. 🪂"
      );
    }
  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
  }
}
