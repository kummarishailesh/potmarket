import nodemailer from 'nodemailer';
import { invoicePdf } from './invoice.js';

const hasBrevo = () => Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
const hasSmtp = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const sender = () => ({ name: process.env.BREVO_SENDER_NAME || 'PotMarket', email: process.env.BREVO_SENDER_EMAIL });
const createTransporter = () => nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: String(process.env.SMTP_PORT || 587) === '465', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });

const sendEmail = async ({ to, subject, textContent, htmlContent, attachments = [] }) => {
    if (hasBrevo()) {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ sender: sender(), to: [{ email: to }], subject, textContent, htmlContent, attachment: attachments.map(({ filename, content }) => ({ name: filename, content: content.toString('base64') })) }) });
        if (!response.ok) { const details = await response.text(); throw new Error(`Brevo email failed (${response.status}): ${details.slice(0, 240)}`); }
        return true;
    }
    if (!hasSmtp()) return false;
    await createTransporter().sendMail({ from: `PotMarket <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`, to, subject, text: textContent, html: htmlContent, attachments });
    return true;
};

export const sendProductAnnouncement = async (product, recipients) => {
    if ((!hasBrevo() && !hasSmtp()) || !recipients.length) return { sent: 0, skipped: recipients.length };
    const results = await Promise.allSettled(recipients.map(email => sendEmail({ to: email, subject: `New at PotMarket: ${product.name}`, textContent: `A new product is available at PotMarket: ${product.name}.`, htmlContent: `<div style="font-family:Arial,sans-serif"><h2>New at PotMarket</h2><p><strong>${product.name}</strong> is now available.</p><p>Visit PotMarket to view the product.</p></div>` })));
    return { sent: results.filter(result => result.status === 'fulfilled' && result.value).length, failed: results.filter(result => result.status === 'rejected').length };
};

export const sendRegistrationOtp = async (email, otp) => {
    if (!hasBrevo() && !hasSmtp()) return false;
    await sendEmail({ to: email, subject: 'PotMarket account verification code', textContent: `Hello, your PotMarket verification code is ${otp}. This code expires in 10 minutes. If you did not request an account, you can ignore this email.`, htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#17212b"><h2 style="color:#0f766e">Verify your PotMarket account</h2><p>Hello,</p><p>Use the verification code below to complete your PotMarket registration:</p><p style="font-size:32px;font-weight:bold;letter-spacing:10px;color:#0f766e">${otp}</p><p>This code expires in <strong>10 minutes</strong>. If you did not request an account, you can ignore this message.</p><p>Regards,<br><strong>PotMarket</strong></p></div>` });
    return true;
};

export const sendPasswordResetOtp = async (email, otp) => {
    if (!hasBrevo() && !hasSmtp()) return false;
    await sendEmail({ to: email, subject: 'PotMarket password reset code', textContent: `Your PotMarket password reset code is ${otp}. It expires in 10 minutes.`, htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#17212b"><h2 style="color:#0f766e">Reset your PotMarket password</h2><p>Use this verification code to set a new password:</p><p style="font-size:32px;font-weight:bold;letter-spacing:10px;color:#0f766e">${otp}</p><p>This code expires in <strong>10 minutes</strong>. If you did not request a password reset, ignore this email.</p><p>Regards,<br><strong>PotMarket</strong></p></div>` });
    return true;
};

export const sendOrderConfirmation = async order => {
        if (!order?.customerEmail || (!hasBrevo() && !hasSmtp())) return false;
        const invoice = await invoicePdf(order);
        const items = (order.items || []).map(item => `<tr><td class="email-item" style="padding:14px 8px 14px 0;border-bottom:1px solid #ded7d0;color:#334a38;font-weight:600;line-height:1.4;overflow-wrap:anywhere">${item.name || 'Product'} x ${item.quantity || 1}</td><td class="email-price" style="padding:14px 0;border-bottom:1px solid #ded7d0;text-align:right;color:#334a38;white-space:nowrap;vertical-align:top">INR ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td></tr>`).join('');
        const firstName = String(order.customerName || 'Customer').split(' ')[0];
        const storeUrl = process.env.STORE_URL || 'http://localhost:3000';
        const htmlContent = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
            @media screen and (max-width: 600px) {
                .email-shell { padding: 18px 10px !important; }
                .email-container { width: 100% !important; }
                .email-header { table-layout: auto !important; }
                .email-header td:first-child { width: 42% !important; }
                .email-header td:last-child { width: 58% !important; white-space: nowrap !important; word-break: keep-all !important; overflow-wrap: normal !important; }
                .email-header td { font-size: 16px !important; }
                .email-header td:last-child { font-size: 17px !important; letter-spacing: 0 !important; }
                .email-thanks { padding: 38px 0 44px !important; font-size: 48px !important; }
                .email-copy { font-size: 15px !important; }
                .email-actions td { display: block !important; width: 100% !important; padding: 0 0 10px !important; }
                .email-button { box-sizing: border-box !important; display: block !important; width: 100% !important; }
                .email-summary { padding-top: 28px !important; }
                .email-summary h2 { font-size: 19px !important; }
                .email-item { font-size: 14px !important; }
            }
        </style></head><body style="margin:0;padding:0;background:#f3e8e2;color:#334a38;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%"><table role="presentation" width="100%" style="border-collapse:collapse;background:#f3e8e2"><tr><td class="email-shell" align="center" style="padding:32px 12px"><table role="presentation" class="email-container" width="680" style="width:100%;max-width:680px;border-collapse:collapse;background:#f3e8e2"><tr><td><table role="presentation" class="email-header" width="100%" style="border-collapse:collapse;table-layout:fixed"><tr><td style="font-family:Georgia,serif;font-size:13px;letter-spacing:3px;line-height:1.25;padding:8px 0;color:#334a38">P<br><span style="font-size:9px;letter-spacing:2px">POTMARKET</span></td><td style="text-align:right;font-family:Georgia,serif;font-size:21px;letter-spacing:1px;line-height:1.15;color:#334a38">ORDER<br>CONFIRMATION</td></tr></table><div class="email-thanks" style="text-align:center;padding:62px 0 70px;font-family:Georgia,serif;font-size:78px;line-height:.92;letter-spacing:1px;color:#334a38;overflow-wrap:anywhere">THANK<br>YOU</div><div class="email-copy" style="font-size:16px;line-height:1.7;color:#77736f;overflow-wrap:anywhere"><p>Hi ${firstName},</p><p>Thanks for ordering. A few quick notes: Adult signature required. Please be ready to provide proof of ID upon delivery.</p><p style="margin-top:48px"><strong style="color:#334a38">Recipes:</strong><br>All our recipes are available at <em>potmarket.com</em>, and we add more each week. Let us know if there is something you are craving.</p></div><hr style="border:0;border-top:1px solid #aaa39d;margin:38px 0"><table role="presentation" class="email-actions" width="100%" style="border-collapse:collapse;text-align:center"><tr><td style="padding:0 0 10px"><a class="email-button" href="${storeUrl}/orders/${order.id}" style="display:inline-block;border:1px solid #334a38;color:#334a38;padding:13px 34px;text-decoration:none;font-size:16px;line-height:1.2">VIEW YOUR ORDER</a></td></tr><tr><td style="font-weight:bold;padding:0 0 10px">or</td></tr><tr><td style="padding:0"><a class="email-button" href="${storeUrl}" style="display:inline-block;background:#334a38;color:#fff;padding:13px 44px;text-decoration:none;font-size:16px;line-height:1.2">VISIT OUR STORE</a></td></tr></table><div class="email-summary" style="border-top:1px solid #aaa39d;margin-top:48px;padding-top:42px"><h2 style="font-size:22px;letter-spacing:1px;margin:0 0 28px;color:#334a38">ORDER SUMMARY</h2><table role="presentation" width="100%" style="width:100%;border-collapse:collapse;table-layout:fixed">${items}<tr><td style="padding:18px 8px 0 0;color:#334a38;font-weight:bold;overflow-wrap:anywhere">TOTAL</td><td style="padding:18px 0 0;text-align:right;color:#334a38;font-weight:bold;white-space:nowrap">INR ${Number(order.total || 0).toFixed(2)}</td></tr></table></div><p style="margin:48px 0 0;font-size:12px;line-height:1.5;color:#77736f;text-align:center;overflow-wrap:anywhere">Questions? Reply to this email and our team will help.</p></td></tr></table></td></tr></table></body></html>`;
        return sendEmail({ to: order.customerEmail, subject: `PotMarket order confirmation - ${order.id}`, textContent: `Hi ${firstName}, thanks for ordering. Your order ${order.id} is confirmed. Your invoice is attached. Total: INR ${Number(order.total || 0).toFixed(2)}.`, htmlContent, attachments: [{ filename: `invoice-${order.id}.pdf`, content: invoice, contentType: 'application/pdf' }] });
};
