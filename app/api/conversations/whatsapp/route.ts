import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST - Save WhatsApp conversation messages from n8n
 * This endpoint receives messages from your n8n WhatsApp workflow
 * and stores them in the conversations table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Optional: Add API key authentication
    const apiKey = request.headers.get('x-api-key');
    if (process.env.WHATSAPP_WEBHOOK_SECRET && apiKey !== process.env.WHATSAPP_WEBHOOK_SECRET) {
      console.error('❌ Unauthorized WhatsApp webhook request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      sessionId,
      message,
      sender,
      channel = 'whatsapp',
      whatsappMessageId,
      whatsappPhoneNumber,
      whatsappProfileName,
      mediaUrl,
      mediaType,
      customerEmail,
      customerName
    } = body;

    // Validate required fields
    if (!sessionId || !message || !sender) {
      console.error('❌ Missing required fields:', { sessionId, message, sender });
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, message, sender' },
        { status: 400 }
      );
    }

    // Validate sender value
    if (!['user', 'bot'].includes(sender)) {
      return NextResponse.json(
        { error: 'Sender must be either "user" or "bot"' },
        { status: 400 }
      );
    }

    console.log('📨 Saving WhatsApp message to database:', {
      sessionId,
      sender,
      channel,
      phoneNumber: whatsappPhoneNumber,
      messageLength: message.length
    });

    // Insert conversation message
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        session_id: sessionId,
        message: message,
        sender: sender,
        channel: channel,
        whatsapp_message_id: whatsappMessageId || null,
        whatsapp_phone_number: whatsappPhoneNumber || null,
        whatsapp_profile_name: whatsappProfileName || null,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        customer_email: customerEmail || null,
        customer_name: customerName || whatsappProfileName || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save message to database', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ WhatsApp message saved successfully:', data.id);

    return NextResponse.json({
      success: true,
      messageId: data.id,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('❌ Error in WhatsApp conversation endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve WhatsApp conversations
 * Optional endpoint to fetch WhatsApp conversations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const phoneNumber = searchParams.get('phoneNumber');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('channel', 'whatsapp')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else if (phoneNumber) {
      query = query.eq('whatsapp_phone_number', phoneNumber);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching WhatsApp conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversations: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in GET endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
