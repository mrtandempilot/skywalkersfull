import { supabaseAdmin } from './supabase-admin';
import { generateQRCode, generatePaymentLink } from './invoice-utils';

interface BookingData {
  id: string;
  customer_name: string;
  customer_email: string;
  tour_name: string;
  booking_date: string;
  tour_start_time: string;
  total_amount?: number;
  flight_duration_minutes?: number;
  customer_id?: string;
  hotel_name?: string;
}

export async function createInvoiceFromBooking(booking: BookingData): Promise<any> {
  try {
    console.log('Creating invoice for booking:', booking.id);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Default values for paragliding
    const subtotal = booking.total_amount || 100; // Default $100 if not set
    const taxRate = 20.0; // 20% VAT
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Determine tour type from tour name
    let tourType: 'Solo' | 'Tandem' | 'VIP' = 'Tandem'; // Default
    if (booking.tour_name?.toLowerCase().includes('solo')) {
      tourType = 'Solo';
    } else if (booking.tour_name?.toLowerCase().includes('vip')) {
      tourType = 'VIP';
    }

    // Generate payment link and QR code
    const paymentLink = generatePaymentLink(invoiceNumber, totalAmount, 'USD');
    const qrCodeData = await generateQRCode(paymentLink);

    // Set due date (30 days from now)
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const issueDate = new Date().toISOString().split('T')[0];

    // Create invoice data
    const invoiceData = {
      invoice_number: invoiceNumber,
      booking_id: booking.id,
      customer_id: booking.customer_id,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_address: booking.hotel_name || '',

      issue_date: issueDate,
      due_date: dueDate,

      subtotal: subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,

      currency: 'USD',
      status: 'sent', // Automatically mark as sent

      // Paragliding-specific fields
      flight_date: booking.booking_date,
      flight_time: booking.tour_start_time,
      flight_duration_minutes: booking.flight_duration_minutes || 30,
      tour_type: tourType,
      payment_method_detail: 'Cash', // Default, can be updated later
      qr_code_data: qrCodeData,
      invoice_language: 'en', // Default to English

      notes: `Auto-generated invoice for ${booking.tour_name} booking`,
      payment_terms: 'Payment due within 30 days',
    };

    // Insert invoice into database
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }

    console.log('✅ Invoice created successfully:', invoice.invoice_number);
    return invoice;
  } catch (error) {
    console.error('Error in createInvoiceFromBooking:', error);
    throw error;
  }
}

// Helper function to generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');

  // Get the count of invoices this month
  const startOfMonth = `${year}-${month}-01`;
  const endOfMonth = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`;

  const { count } = await supabaseAdmin
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth)
    .lt('created_at', endOfMonth);

  const sequence = String((count || 0) + 1).padStart(4, '0');

  return `INV-${year}${month}-${sequence}`;
}
