import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification, testEmailConfiguration, EmailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, emailAddress, test, data } = body;

    console.log('📧 Email API called with:', { type, emailAddress, test });

    // Get user from auth header for security
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('📧 No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('📧 Auth token present:', !!token);

    // Check SMTP configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    console.log('📧 SMTP Config check:', {
      host: !!smtpHost,
      user: !!smtpUser,
      pass: !!smtpPass,
      port: process.env.SMTP_PORT
    });

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({
        error: 'SMTP configuration incomplete. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.local',
        details: {
          smtpHost: !!smtpHost,
          smtpUser: !!smtpUser,
          smtpPass: !!smtpPass
        }
      }, { status: 500 });
    }

    if (test) {
      // Test email configuration
      if (!emailAddress) {
        return NextResponse.json({ error: 'Email address required for testing' }, { status: 400 });
      }

      console.log('📧 Testing email configuration to:', emailAddress);
      const success = await testEmailConfiguration(emailAddress);
      console.log('📧 Test result:', success);

      return NextResponse.json({
        success,
        message: success ? 'Test email sent successfully!' : 'Failed to send test email. Check SMTP configuration and try again.'
      });
    }

    // Send actual notification
    if (!emailAddress || !type) {
      return NextResponse.json({ error: 'Email address and type required' }, { status: 400 });
    }

    let emailTemplate;

    switch (type) {
      case 'booking':
        if (!data) {
          return NextResponse.json({ error: 'Booking data required' }, { status: 400 });
        }
        emailTemplate = EmailTemplates.bookingNotification(data);
        break;

      case 'payment':
        if (!data) {
          return NextResponse.json({ error: 'Payment data required' }, { status: 400 });
        }
        emailTemplate = EmailTemplates.paymentNotification(data);
        break;

      case 'cancellation':
        if (!data) {
          return NextResponse.json({ error: 'Cancellation data required' }, { status: 400 });
        }
        emailTemplate = EmailTemplates.cancellationNotification(data);
        break;

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Set the recipient
    emailTemplate.to = emailAddress;

    console.log('📧 Sending', type, 'email to:', emailAddress);
    const success = await sendEmailNotification(emailTemplate);
    console.log('📧 Send result:', success);

    return NextResponse.json({
      success,
      message: success ? 'Email sent successfully!' : 'Failed to send email. Check SMTP configuration.'
    });

  } catch (error: any) {
    console.error('📧 Email API error:', error);
    console.error('📧 Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });

    return NextResponse.json(
      {
        error: error.message || 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          smtpConfig: {
            host: !!process.env.SMTP_HOST,
            user: !!process.env.SMTP_USER,
            pass: !!process.env.SMTP_PASS,
            port: process.env.SMTP_PORT
          }
        } : undefined
      },
      { status: 500 }
    );
  }
}
