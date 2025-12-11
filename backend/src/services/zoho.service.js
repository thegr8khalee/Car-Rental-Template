// lib/zohoMailService.js
import nodemailer from 'nodemailer';
import brandingConfig from '../config/branding.js';

const primaryBrandColor = brandingConfig?.branding?.colors?.primary ?? '#FF1A1A';

class ZohoMailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.ZOHO_MAIL_HOST || 'smtp.zoho.com',
            port: process.env.ZOHO_MAIL_PORT || 465,
            secure: true, // use SSL
            auth: {
                user: process.env.ZOHO_MAIL_USER, // your Zoho email
                pass: process.env.ZOHO_MAIL_PASSWORD, // your Zoho password or app-specific password
            },
        });

    this.fromEmail = process.env.ZOHO_MAIL_FROM || process.env.ZOHO_MAIL_USER;
    this.fromName =
      process.env.ZOHO_MAIL_FROM_NAME || brandingConfig?.company?.name || 'Your Company Name';
    }

    /**
     * Verify the email configuration
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Zoho Mail Service is ready to send emails');
            return true;
        } catch (error) {
            console.error('❌ Zoho Mail Service connection failed:', error);
            return false;
        }
    }

    /**
     * Send a single email
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.html - HTML content
     * @param {string} options.text - Plain text content (optional)
     * @param {Array} options.attachments - Attachments (optional)
     */
    async sendEmail({ to, subject, html, text, attachments = [] }) {
        try {
            const mailOptions = {
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to,
                subject,
                html,
                text: text || this.stripHtml(html),
                attachments,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${to}: ${info.messageId}`);
            return {
                success: true,
                messageId: info.messageId,
                to,
            };
        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error);
            return {
                success: false,
                error: error.message,
                to,
            };
        }
    }

    /**
     * Send broadcast email to newsletter subscribers
     * @param {Object} options - Broadcast options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.content - HTML content
     * @param {string} options.imageUrl - Header image URL (optional)
     * @param {string} options.subscriberName - Subscriber's name (optional)
     * @param {string} options.senderName - Sender's name (optional)
     */
    async sendBroadcastEmail({
        to,
        subject,
        content,
        imageUrl = null,
        subscriberName = null,
        senderName = null,
    }) {
        const html = this.createBroadcastTemplate({
            content,
            imageUrl,
            subscriberName,
            senderName,
            unsubscribeLink: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(to)}`,
        });

        return this.sendEmail({
            to,
            subject,
            html,
        });
    }

    /**
     * Send welcome email to new subscriber
     * @param {Object} options
     * @param {string} options.to - Recipient email
     * @param {string} options.name - Subscriber's name
     */
    async sendWelcomeEmail({ to, name }) {
        const subject = 'Welcome to Our Newsletter!';
        const html = this.createWelcomeTemplate({
            name,
            unsubscribeLink: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(to)}`,
        });

        return this.sendEmail({
            to,
            subject,
            html,
        });
    }

    /**
     * Send email verification
     * @param {Object} options
     * @param {string} options.to - Recipient email
     * @param {string} options.name - User's name
     * @param {string} options.verificationLink - Verification URL
     */
    async sendVerificationEmail({ to, name, verificationLink }) {
        const subject = 'Verify Your Email Address';
        const html = this.createVerificationTemplate({
            name,
            verificationLink,
        });

        return this.sendEmail({
            to,
            subject,
            html,
        });
    }

    /**
     * Send password reset email
     * @param {Object} options
     * @param {string} options.to - Recipient email
     * @param {string} options.name - User's name
     * @param {string} options.resetLink - Password reset URL
     */
    async sendPasswordResetEmail({ to, name, resetLink }) {
        const subject = 'Reset Your Password';
        const html = this.createPasswordResetTemplate({
            name,
            resetLink,
        });

        return this.sendEmail({
            to,
            subject,
            html,
        });
    }

    /**
     * Send offer email (for car selling submissions)
     * @param {Object} options
     * @param {string} options.to - Recipient email
     * @param {string} options.name - Customer's name
     * @param {string} options.carDetails - Car information
     * @param {number} options.offerAmount - Offer amount
     */
    async sendOfferEmail({ to, name, carDetails, offerAmount }) {
        const subject = `We Have an Offer for Your ${carDetails}`;
        const html = this.createOfferTemplate({
            name,
            carDetails,
            offerAmount,
        });

        return this.sendEmail({
            to,
            subject,
            html,
        });
    }

    /**
     * Send bulk emails with rate limiting
     * @param {Array} recipients - Array of email configurations
     * @param {number} batchSize - Number of emails per batch
     * @param {number} delayMs - Delay between batches in milliseconds
     */
    async sendBulkEmails(recipients, batchSize = 50, delayMs = 1000) {
        const results = [];

        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);

            const batchPromises = batch.map((recipient) =>
                this.sendEmail(recipient).catch((error) => ({
                    success: false,
                    error: error.message,
                    to: recipient.to,
                }))
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Add delay between batches to avoid rate limiting
            if (i + batchSize < recipients.length) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }

        return results;
    }

    /**
     * Create broadcast email HTML template
     */
    createBroadcastTemplate({
        content,
        imageUrl,
        subscriberName,
        senderName,
        unsubscribeLink,
    }) {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${primaryBrandColor}; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${this.fromName}</h1>
            </td>
          </tr>
          
          ${imageUrl ? `
          <!-- Header Image -->
          <tr>
            <td>
              <img src="${imageUrl}" alt="Header" style="width: 100%; height: auto; display: block;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${subscriberName ? `<p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi ${subscriberName},</p>` : ''}
              
              <div style="font-size: 16px; line-height: 1.6; color: #333;">
                ${content}
              </div>
              
              ${senderName ? `
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Best regards,<br>
                <strong>${senderName}</strong><br>
                ${this.fromName}
              </p>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666;">
                You're receiving this email because you subscribed to our newsletter.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                <a href="${unsubscribeLink}" style="color: ${primaryBrandColor}; text-decoration: none;">Unsubscribe</a> | 
                <a href="${process.env.FRONTEND_URL}" style="color: ${primaryBrandColor}; text-decoration: none;">Visit Website</a>
              </p>
              <p style="margin: 15px 0 0; font-size: 12px; color: #999;">
                © ${new Date().getFullYear()} ${this.fromName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }

    /**
     * Create welcome email template
     */
    createWelcomeTemplate({ name, unsubscribeLink }) {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: ${primaryBrandColor}; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">Welcome to ${this.fromName}!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #333; margin: 0 0 20px;">Thanks for Subscribing${name ? ', ' + name : ''}!</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 20px 0;">
                You're now part of our community. Get ready to receive the latest updates, 
                exclusive content, and special offers directly to your inbox.
              </p>
              <a href="${process.env.FRONTEND_URL}" style="display: inline-block; margin: 20px 0; padding: 15px 30px; background-color: ${primaryBrandColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Visit Our Website
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                <a href="${unsubscribeLink}" style="color: ${primaryBrandColor};">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }

    /**
     * Create verification email template
     */
    createVerificationTemplate({ name, verificationLink }) {
        return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
    <h2>Verify Your Email</h2>
    <p>Hi ${name},</p>
    <p>Please click the button below to verify your email address:</p>
  <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: ${primaryBrandColor}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
      Verify Email
    </a>
    <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
  </div>
</body>
</html>
    `;
    }

    /**
     * Create password reset template
     */
    createPasswordResetTemplate({ name, resetLink }) {
        return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
    <h2>Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
  <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: ${primaryBrandColor}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
      Reset Password
    </a>
    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>
    `;
    }

    /**
     * Create offer email template
     */
    createOfferTemplate({ name, carDetails, offerAmount }) {
        return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
  <h2 style="color: ${primaryBrandColor};">Great News, ${name}!</h2>
    <p>We've reviewed your ${carDetails} and we're excited to make you an offer:</p>
    <div style="background: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
  <h1 style="color: ${primaryBrandColor}; margin: 0;">₦${offerAmount.toLocaleString()}</h1>
    </div>
    <p>This is a no-obligation offer. To accept or discuss further, please contact us at your earliest convenience.</p>
  <a href="${process.env.FRONTEND_URL}/contact" style="display: inline-block; padding: 12px 24px; background: ${primaryBrandColor}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
      Contact Us
    </a>
  </div>
</body>
</html>
    `;
    }

    /**
     * Strip HTML tags from text
     */
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }
}

// Export singleton instance
export default new ZohoMailService();