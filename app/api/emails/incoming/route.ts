import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendEmailNotification } from '@/lib/email';

interface IncomingEmailWebhook {
  // SendGrid webhook format
  sg_message_id?: string;
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  'sendgrid-attachments'?: any[];

  // Mailgun webhook format
  'message-id'?: string;
  sender?: string;
  recipient?: string;
  'body-plain'?: string;
  'body-html'?: string;
  'attachment-count'?: string;
  'mailgun-attachments'?: any[];

  // Generic format
  messageId?: string;
  fromEmail?: string;
  fromName?: string;
  toEmail?: string;
  emailSubject?: string;
  plainText?: string;
  htmlContent?: string;
  rawContent?: string;
  emailAttachments?: any[];
  provider?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Incoming email webhook received');

    const supabase = supabaseAdmin;
    const body: IncomingEmailWebhook = await request.json();

    console.log('📧 Webhook body keys:', Object.keys(body));

    // Extract email data based on provider
    let emailData: {
      messageId: string;
      fromEmail: string;
      fromName?: string;
      toEmail: string;
      subject: string;
      plainText?: string;
      htmlContent?: string;
      rawContent?: string;
      attachments?: any[];
      provider: string;
    };

    // Detect provider and normalize data
    if (body.sg_message_id || body.from) {
      // SendGrid format
      emailData = {
        messageId: body.sg_message_id || `sg-${Date.now()}`,
        fromEmail: body.from || '',
        toEmail: body.to || '',
        subject: body.subject || '(No subject)',
        plainText: body.text,
        htmlContent: body.html,
        attachments: body['sendgrid-attachments'] || [],
        provider: 'sendgrid'
      };
    } else if (body['message-id'] || body.sender) {
      // Mailgun format
      emailData = {
        messageId: body['message-id'] || `mg-${Date.now()}`,
        fromEmail: body.sender || '',
        toEmail: body.recipient || '',
        subject: body.subject || '(No subject)',
        plainText: body['body-plain'],
        htmlContent: body['body-html'],
        attachments: body['mailgun-attachments'] || [],
        provider: 'mailgun'
      };
    } else if (body.messageId || body.fromEmail) {
      // Generic/custom format
      emailData = {
        messageId: body.messageId || `custom-${Date.now()}`,
        fromEmail: body.fromEmail || '',
        fromName: body.fromName,
        toEmail: body.toEmail || '',
        subject: body.emailSubject || '(No subject)',
        plainText: body.plainText,
        htmlContent: body.htmlContent,
        rawContent: body.rawContent,
        attachments: body.emailAttachments || [],
        provider: body.provider || 'unknown'
      };
    } else {
      console.log('📧 Unsupported webhook format');
      return NextResponse.json({ error: 'Unsupported webhook format' }, { status: 400 });
    }

    // Validate required fields
    if (!emailData.fromEmail || !emailData.toEmail || !emailData.subject) {
      console.log('📧 Missing required email fields');
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('incoming_emails')
      .select('id')
      .eq('message_id', emailData.messageId)
      .single();

    if (existingEmail) {
      console.log('📧 Email already processed:', emailData.messageId);
      return NextResponse.json({ message: 'Email already processed' });
    }

    // Process attachments
    const processedAttachments = (emailData.attachments || []).map((attachment: any, index: number) => ({
      id: `attachment-${index}`,
      filename: attachment.filename || attachment.name || `attachment-${index}`,
      contentType: attachment['content-type'] || attachment.contentType || 'application/octet-stream',
      size: attachment.size || 0,
      url: attachment.url || null
    }));

    // Insert email into database
    const { data: insertedEmail, error: insertError } = await supabase
      .from('incoming_emails')
      .insert({
        message_id: emailData.messageId,
        from_email: emailData.fromEmail,
        from_name: emailData.fromName,
        to_email: emailData.toEmail,
        subject: emailData.subject,
        plain_text: emailData.plainText,
        html_content: emailData.htmlContent,
        raw_content: emailData.rawContent,
        attachments: processedAttachments,
        email_provider: emailData.provider,
        webhook_data: body
      })
      .select()
      .single();

    if (insertError) {
      console.error('📧 Error inserting email:', insertError);
      return NextResponse.json({ error: 'Failed to store email' }, { status: 500 });
    }

    console.log('📧 Email stored successfully:', insertedEmail.id);

    // Check for forwarding rules
    await processEmailForwarding(supabase, insertedEmail);

    // Check for auto-reply
    await processAutoReply(supabase, insertedEmail);

    return NextResponse.json({
      success: true,
      emailId: insertedEmail.id,
      message: 'Email processed successfully'
    });

  } catch (error: any) {
    console.error('📧 Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Process email forwarding based on configuration
async function processEmailForwarding(supabase: any, email: any) {
  try {
    // Get active forwarding configurations
    const { data: forwardingConfigs, error } = await supabase
      .from('email_forwarding_config')
      .select('*')
      .eq('is_active', true);

    if (error || !forwardingConfigs) {
      console.log('📧 No forwarding configurations found');
      return;
    }

    const fromDomain = email.from_email.split('@')[1]?.toLowerCase();

    for (const config of forwardingConfigs) {
      // Check if domain matches
      const domainMatches = config.from_domains.length === 0 ||
        config.from_domains.some((domain: string) => domain.toLowerCase() === fromDomain);

      if (!domainMatches) continue;

      // Check additional conditions
      if (config.conditions && Object.keys(config.conditions).length > 0) {
        const conditions = config.conditions;

        // Subject pattern matching
        if (conditions.subject_pattern) {
          const regex = new RegExp(conditions.subject_pattern, 'i');
          if (!regex.test(email.subject)) continue;
        }

        // Priority threshold
        if (conditions.min_priority) {
          const priorityLevels = { low: 1, normal: 2, high: 3, urgent: 4 };
          if (priorityLevels[email.priority] < priorityLevels[conditions.min_priority]) continue;
        }
      }

      // Forward the email
      console.log('📧 Forwarding email to:', config.to_emails);

      for (const forwardTo of config.to_emails) {
        try {
          const forwardSuccess = await sendEmailNotification({
            to: forwardTo,
            subject: `FWD: ${email.subject}`,
            html: `
              <div style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 16px 0;">
                <p><strong>Forwarded Email</strong></p>
                <p><strong>From:</strong> ${email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}</p>
                <p><strong>To:</strong> ${email.to_email}</p>
                <p><strong>Received:</strong> ${new Date(email.received_at).toLocaleString()}</p>
              </div>
              ${email.html_content || email.plain_text?.replace(/\n/g, '<br>') || '<p>No content</p>'}
            `,
            text: `
Forwarded Email

From: ${email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
To: ${email.to_email}
Received: ${new Date(email.received_at).toLocaleString()}

${email.plain_text || 'No content'}
            `
          });

          if (forwardSuccess) {
            console.log('📧 Email forwarded successfully to:', forwardTo);
          } else {
            console.error('📧 Failed to forward email to:', forwardTo);
          }
        } catch (forwardError) {
          console.error('📧 Forwarding error:', forwardError);
        }
      }

      // Update email with forwarding info
      await supabase
        .from('incoming_emails')
        .update({
          forwarded_to: config.to_emails,
          forwarded_at: new Date().toISOString()
        })
        .eq('id', email.id);

      // Auto-archive if configured
      if (config.auto_archive) {
        await supabase
          .from('incoming_emails')
          .update({ is_archived: true })
          .eq('id', email.id);
      }
    }
  } catch (error) {
    console.error('📧 Error processing email forwarding:', error);
  }
}

// Process auto-reply
async function processAutoReply(supabase: any, email: any) {
  try {
    // Get forwarding configs with auto-reply enabled
    const { data: configsWithAutoReply, error } = await supabase
      .from('email_forwarding_config')
      .select('*')
      .eq('is_active', true)
      .eq('auto_reply_enabled', true)
      .not('auto_reply_template', 'is', null);

    if (error || !configsWithAutoReply) return;

    const fromDomain = email.from_email.split('@')[1]?.toLowerCase();

    for (const config of configsWithAutoReply) {
      const domainMatches = config.from_domains.length === 0 ||
        config.from_domains.some((domain: string) => domain.toLowerCase() === fromDomain);

      if (!domainMatches) continue;

      // Send auto-reply
      console.log('📧 Sending auto-reply to:', email.from_email);

      const autoReplySuccess = await sendEmailNotification({
        to: email.from_email,
        subject: `Re: ${email.subject}`,
        html: config.auto_reply_template.replace(/\{\{([^}]+)\}\}/g, (match: string, key: string) => {
          switch (key) {
            case 'sender_name': return email.from_name || 'Valued Customer';
            case 'original_subject': return email.subject;
            case 'received_date': return new Date(email.received_at).toLocaleDateString();
            default: return match;
          }
        }),
        text: config.auto_reply_template
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\{\{([^}]+)\}\}/g, (match: string, key: string) => {
            switch (key) {
              case 'sender_name': return email.from_name || 'Valued Customer';
              case 'original_subject': return email.subject;
              case 'received_date': return new Date(email.received_at).toLocaleDateString();
              default: return match;
            }
          })
      });

      if (autoReplySuccess) {
        console.log('📧 Auto-reply sent successfully');
        await supabase
          .from('incoming_emails')
          .update({
            auto_replied: true,
            auto_reply_template: config.auto_reply_template
          })
          .eq('id', email.id);
      } else {
        console.error('📧 Failed to send auto-reply');
      }

      break; // Only send one auto-reply
    }
  } catch (error) {
    console.error('📧 Error processing auto-reply:', error);
  }
}

// GET endpoint to retrieve emails (for testing)
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;

    const { data: emails, error } = await supabase
      .from('incoming_emails')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ emails });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
