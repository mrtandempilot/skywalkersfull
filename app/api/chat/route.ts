import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://mvt36n7e.rpcld.com/webhook/a487d0ab-c749-4703-9125-93e88642d355/chat';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, visitorInfo, customerEmail, customerName } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const currentSessionId = sessionId || `session_${Date.now()}`;

    // Save user message to database
    try {
      const { data, error } = await supabaseAdmin.from('conversations').insert({
        session_id: currentSessionId,
        customer_email: customerEmail || null,
        customer_name: customerName || null,
        message: message,
        sender: 'user',
        visitor_info: visitorInfo || null,
        created_at: new Date().toISOString()
      });
      
      if (error) {
        console.error('❌ Database error saving user message:', error);
        console.error('   Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ User message saved successfully');
      }
    } catch (dbError) {
      console.error('❌ Exception saving user message:', dbError);
    }

    // Send message to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message,
        sessionId: currentSessionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to communicate with chatbot service');
    }

    const data = await response.json();
    const botResponse = data.output || data.response || data.message || 'Thank you for your message. How can I assist you further?';

    // Save bot response to database
    try {
      const { data, error } = await supabaseAdmin.from('conversations').insert({
        session_id: currentSessionId,
        customer_email: customerEmail || null,
        customer_name: customerName || null,
        message: botResponse,
        sender: 'bot',
        created_at: new Date().toISOString()
      });
      
      if (error) {
        console.error('❌ Database error saving bot response:', error);
        console.error('   Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Bot response saved successfully');
      }
    } catch (dbError) {
      console.error('❌ Exception saving bot response:', dbError);
    }

    return NextResponse.json({
      response: botResponse,
      success: true,
      sessionId: currentSessionId
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        response: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch conversations for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Fetch specific conversation
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return NextResponse.json(data || []);
    } else {
      // Fetch all conversations grouped by session
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Group by session_id
      const grouped = (data || []).reduce((acc: any, msg: any) => {
        if (!acc[msg.session_id]) {
          acc[msg.session_id] = [];
        }
        acc[msg.session_id].push(msg);
        return acc;
      }, {});

      // Convert to array with session info
      const sessions = Object.keys(grouped).map(sessionId => ({
        sessionId,
        messages: grouped[sessionId].sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
        lastMessage: grouped[sessionId][grouped[sessionId].length - 1],
        messageCount: grouped[sessionId].length,
        visitorInfo: grouped[sessionId].find((m: any) => m.visitor_info)?.visitor_info
      }));

      // Sort by last message time
      sessions.sort((a, b) => 
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );

      return NextResponse.json(sessions);
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
