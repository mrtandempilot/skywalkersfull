import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET - Fetch all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');

    let query = supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate tax and total
    const subtotal = body.subtotal || 0;
    const taxRate = body.tax_rate || 20.0; // Default 20% KDV
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Generate QR code if not provided
    let qrCodeData = body.qr_code_data;
    if (!qrCodeData) {
      const QRCode = require('qrcode');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
      const paymentLink = `${baseUrl}/payment?invoice=${invoiceNumber}&amount=${totalAmount}&currency=${body.currency || 'USD'}`;
      try {
        qrCodeData = await QRCode.toDataURL(paymentLink, {
          width: 200,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
      }
    }

    const invoiceData = {
      invoice_number: invoiceNumber,
      booking_id: body.booking_id,
      customer_id: body.customer_id,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_address: body.customer_address,
      
      issue_date: body.issue_date || new Date().toISOString().split('T')[0],
      due_date: body.due_date,
      
      subtotal: subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      
      currency: body.currency || 'USD',
      status: body.status || 'draft',
      
      // Paragliding-specific fields
      pilot_id: body.pilot_id,
      pilot_name: body.pilot_name,
      flight_date: body.flight_date,
      flight_time: body.flight_time,
      flight_duration_minutes: body.flight_duration_minutes,
      tour_type: body.tour_type,
      payment_method_detail: body.payment_method_detail,
      qr_code_data: qrCodeData,
      customer_signature: body.customer_signature,
      invoice_language: body.invoice_language || 'en',
      company_logo_url: body.company_logo_url,
      
      notes: body.notes,
      payment_terms: body.payment_terms,
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      return NextResponse.json(
        { error: 'Failed to create invoice', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update invoice
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Recalculate tax and total if subtotal or tax_rate changed
    if (updateData.subtotal !== undefined || updateData.tax_rate !== undefined) {
      const subtotal = updateData.subtotal;
      const taxRate = updateData.tax_rate || 20.0;
      updateData.tax_amount = (subtotal * taxRate) / 100;
      updateData.total_amount = subtotal + updateData.tax_amount;
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      return NextResponse.json(
        { error: 'Failed to update invoice', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      return NextResponse.json(
        { error: 'Failed to delete invoice', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Get the count of invoices this month
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-${month}-01`)
    .lt('created_at', `${year}-${Number(month) + 1}-01`);

  const sequence = String((count || 0) + 1).padStart(4, '0');
  
  return `INV-${year}${month}-${sequence}`;
}
