import QRCode from 'qrcode';

// Generate QR code for payment link
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

// Generate payment link for QR code
export function generatePaymentLink(invoiceNumber: string, amount: number, currency: string = 'USD'): string {
  // This can be replaced with your actual payment gateway URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
  return `${baseUrl}/payment?invoice=${invoiceNumber}&amount=${amount}&currency=${currency}`;
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string, language: 'tr' | 'en' = 'en'): string {
  const date = new Date(dateString);
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time
export function formatTime(timeString: string): string {
  if (!timeString) return '';
  // Handle both HH:mm:ss and HH:mm formats
  const parts = timeString.split(':');
  return `${parts[0]}:${parts[1]}`;
}

// Calculate flight duration display
export function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// Invoice translations
export const invoiceTranslations = {
  en: {
    invoice: 'INVOICE',
    invoiceNumber: 'Invoice Number',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    billTo: 'Bill To',
    flightDetails: 'Flight Details',
    pilot: 'Pilot',
    flightDate: 'Flight Date',
    flightTime: 'Flight Time',
    duration: 'Duration',
    tourType: 'Tour Type',
    description: 'Description',
    amount: 'Amount',
    subtotal: 'Subtotal',
    vat: 'VAT',
    total: 'Total',
    paymentMethod: 'Payment Method',
    notes: 'Notes',
    paymentTerms: 'Payment Terms',
    customerSignature: 'Customer Signature',
    thankYou: 'Thank you for your business!',
    scanToPay: 'Scan to Pay',
  },
  tr: {
    invoice: 'FATURA',
    invoiceNumber: 'Fatura Numarası',
    issueDate: 'Düzenleme Tarihi',
    dueDate: 'Vade Tarihi',
    billTo: 'Fatura Edilen',
    flightDetails: 'Uçuş Detayları',
    pilot: 'Pilot',
    flightDate: 'Uçuş Tarihi',
    flightTime: 'Uçuş Saati',
    duration: 'Süre',
    tourType: 'Tur Tipi',
    description: 'Açıklama',
    amount: 'Tutar',
    subtotal: 'Ara Toplam',
    vat: 'KDV',
    total: 'Toplam',
    paymentMethod: 'Ödeme Yöntemi',
    notes: 'Notlar',
    paymentTerms: 'Ödeme Koşulları',
    customerSignature: 'Müşteri İmzası',
    thankYou: 'İşbirliğiniz için teşekkür ederiz!',
    scanToPay: 'Ödeme İçin Tarayın',
  }
};
