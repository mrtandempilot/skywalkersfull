/**
 * WhatsApp Message Templates Library
 * Pre-defined message templates for common paragliding booking scenarios
 */

import { sendWhatsAppMessage, sendWhatsAppTemplate } from './whatsapp';

export interface BookingDetails {
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  location: string;
  pilotName: string;
  flightType?: string;
  price?: string;
}

export interface PaymentDetails {
  customerName: string;
  customerPhone: string;
  amount: string;
  currency?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
}

export interface ReminderDetails {
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  location: string;
  weatherConditions?: string;
  specialInstructions?: string;
}

/**
 * Send booking confirmation message
 */
export async function sendBookingConfirmation(details: BookingDetails) {
  const message = `
🪂 *Booking Confirmed!*

Hello ${details.customerName}!

Your tandem paragliding flight is confirmed! ✅

📅 *Date:* ${details.date}
🕐 *Time:* ${details.time}
📍 *Location:* ${details.location}
👨‍✈️ *Pilot:* ${details.pilotName}
${details.flightType ? `✈️ *Flight Type:* ${details.flightType}` : ''}
${details.price ? `💰 *Price:* ${details.price}` : ''}

We'll send you a reminder 24 hours before your flight.

*Important reminders:*
• Arrive 15 minutes early
• Wear comfortable shoes and clothes
• Bring sunglasses and sunscreen
• No loose items in pockets

See you in the sky! 🌤️

_Questions? Just reply to this message!_
  `.trim();

  return await sendWhatsAppMessage(details.customerPhone, message);
}

/**
 * Send 24-hour reminder
 */
export async function send24HourReminder(details: ReminderDetails) {
  const message = `
⏰ *Flight Reminder*

Hi ${details.customerName}!

Your paragliding flight is tomorrow! 🪂

📅 ${details.date} at ${details.time}
📍 ${details.location}

${details.weatherConditions ? `🌤️ *Weather:* ${details.weatherConditions}` : ''}

🔴 *Important:*
• Arrive 15 minutes early
• Bring ID and confirmation
${details.specialInstructions ? `• ${details.specialInstructions}` : ''}

Reply *CONFIRM* to confirm or *RESCHEDULE* if you need to change the date.

Looking forward to flying with you! ✨
  `.trim();

  return await sendWhatsAppMessage(details.customerPhone, message);
}

/**
 * Send payment confirmation
 */
export async function sendPaymentConfirmation(details: PaymentDetails) {
  const currency = details.currency || '€';
  const message = `
✅ *Payment Received*

Thank you ${details.customerName}!

Payment of *${currency}${details.amount}* confirmed.

${details.invoiceNumber ? `📄 Invoice: ${details.invoiceNumber}` : ''}
${details.paymentMethod ? `💳 Method: ${details.paymentMethod}` : ''}

Your booking is now fully confirmed! 🎉

We'll send you all the details and a reminder before your flight.

See you soon! 🪂
  `.trim();

  return await sendWhatsAppMessage(details.customerPhone, message);
}

/**
 * Send payment reminder
 */
export async function sendPaymentReminder(details: PaymentDetails & { dueDate: string }) {
  const currency = details.currency || '€';
  const message = `
💰 *Payment Reminder*

Hi ${details.customerName},

This is a friendly reminder about your pending payment.

*Amount due:* ${currency}${details.amount}
*Due date:* ${details.dueDate}
${details.invoiceNumber ? `*Invoice:* ${details.invoiceNumber}` : ''}

Please complete your payment to confirm your booking.

*Payment options:*
• Bank transfer
• Credit card
• Cash on arrival

Reply to this message if you have any questions!
  `.trim();

  return await sendWhatsAppMessage(details.customerPhone, message);
}

/**
 * Send weather cancellation notice
 */
export async function sendWeatherCancellation(
  customerName: string,
  customerPhone: string,
  date: string,
  reason: string
) {
  const message = `
⚠️ *Weather Update*

Hi ${customerName},

Unfortunately, we need to reschedule your flight scheduled for ${date}.

*Reason:* ${reason}

Your safety is our top priority! 🛡️

*Next steps:*
We'll contact you shortly to arrange a new date. You can also reply with your preferred dates.

*Options:*
• Reschedule for another day
• Full refund if preferred

We apologize for the inconvenience and look forward to taking you flying soon! 🪂

Questions? Just reply to this message.
  `.trim();

  return await sendWhatsAppMessage(customerPhone, message);
}

/**
 * Send thank you message after flight
 */
export async function sendThankYouMessage(
  customerName: string,
  customerPhone: string,
  photoUrl?: string
) {
  const message = `
🌟 *Thank You for Flying with Us!*

Hi ${customerName}!

We hope you enjoyed your paragliding experience! 🪂

${photoUrl ? '📸 Your flight photos are ready!' : ''}

*We'd love your feedback!*
Please take a moment to share your experience:
• Reply with a rating (1-5 stars)
• Leave a review on Google

*Share your experience:*
Tag us on social media @skywalkers

*Want to fly again?*
Book your next flight and get 10% off! 🎉

Use code: FLYAGAIN10

Thank you for choosing us! ✨
  `.trim();

  return await sendWhatsAppMessage(customerPhone, message);
}

/**
 * Send general booking inquiry response
 */
export async function sendBookingInquiryResponse(
  customerName: string,
  customerPhone: string
) {
  const message = `
👋 *Hello ${customerName}!*

Thank you for your interest in paragliding! 🪂

*Available flight options:*

🌅 *Tandem Discovery Flight*
• Duration: 15-20 minutes
• Price: €120
• Perfect for first-timers!

🦅 *Thermal Flight*
• Duration: 30-45 minutes
• Price: €180
• Experience soaring like an eagle!

🎥 *Photo/Video Package*
• Price: +€40
• Professional photos and video

*What's included:*
✅ Professional pilot
✅ All equipment
✅ Safety briefing
✅ Insurance
✅ Certificate of flight

*Ready to book?*
Reply with your preferred:
1. Flight type
2. Date
3. Number of people

Or visit our website: [your-website.com]

Questions? Just ask! 😊
  `.trim();

  return await sendWhatsAppMessage(customerPhone, message);
}

/**
 * Send emergency contact information
 */
export async function sendEmergencyContact(customerPhone: string) {
  const message = `
🚨 *Emergency Contact Information*

*For urgent matters:*

📞 Emergency Line: +XX XXX XXX XXXX
📱 WhatsApp: This number

*Office Hours:*
Monday - Sunday: 8:00 - 20:00

*Location:*
[Your launch site address]
📍 GPS: [coordinates]

*In case of emergency at the site:*
1. Call emergency services: 112
2. Contact us immediately
3. Follow pilot instructions

Stay safe! 🛡️
  `.trim();

  return await sendWhatsAppMessage(customerPhone, message);
}

/**
 * Send pre-flight checklist
 */
export async function sendPreFlightChecklist(
  customerName: string,
  customerPhone: string,
  flightDate: string
) {
  const message = `
📋 *Pre-Flight Checklist*

Hi ${customerName}!

Your flight is on ${flightDate}. Here's what to prepare:

*What to bring:*
✅ Valid ID
✅ Comfortable clothes
✅ Closed-toe shoes (sneakers)
✅ Sunglasses
✅ Sunscreen
✅ Light jacket (it's cooler up there!)

*What NOT to bring:*
❌ Loose items in pockets
❌ Flip-flops or sandals
❌ Jewelry or accessories that can fall

*Health requirements:*
• Weight limit: 40-110 kg
• No pregnancy
• No serious heart conditions
• No recent surgeries

*Weather dependent:*
We'll confirm via WhatsApp 2-3 hours before flight time.

Ready to fly? See you soon! 🪂
  `.trim();

  return await sendWhatsAppMessage(customerPhone, message);
}

/**
 * Send custom message (for admin use)
 */
export async function sendCustomMessage(
  customerPhone: string,
  message: string
) {
  return await sendWhatsAppMessage(customerPhone, message);
}

/**
 * Template message examples (these need to be pre-approved by Meta)
 * Use these as examples when creating templates in Facebook Business Manager
 */
export const TEMPLATE_EXAMPLES = {
  booking_confirmation: {
    name: 'booking_confirmation',
    language: 'en',
    parameters: ['{{customer_name}}', '{{date}}', '{{time}}', '{{location}}', '{{pilot_name}}'],
    example: 'Hello John, Your tandem paragliding flight is confirmed! Date: March 15, Time: 10:00 AM, Location: Mount Olympus, Pilot: Captain Sky'
  },
  
  payment_reminder: {
    name: 'payment_reminder',
    language: 'en',
    parameters: ['{{customer_name}}', '{{amount}}', '{{due_date}}'],
    example: 'Hi John, Reminder: Payment of €120 is due by March 10'
  },
  
  flight_reminder_24h: {
    name: 'flight_reminder_24h',
    language: 'en',
    parameters: ['{{customer_name}}', '{{date}}', '{{time}}', '{{location}}', '{{weather}}'],
    example: 'Hi John, Your flight is tomorrow! March 15 at 10:00 AM, Mount Olympus. Weather: Perfect conditions!'
  }
};
