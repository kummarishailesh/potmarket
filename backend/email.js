 //EMAIL.JS
 const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOrderConfirmationEmail = async (order) => {
    if (!order || !order.customerEmail) {
        console.error("Cannot send email: Invalid order data or missing customer email.");
        return false;
    }

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Order Confirmed!</h2>
            </div>
            <div style="padding: 20px;">
              <p>Hello ${order.customerName},</p>
              <p>Thank you for your order! Your order #${order.id} has been confirmed.</p>
              <h3 style="border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Items Ordered:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                </tr>
                ${itemsHtml}
              </table>
              <div style="text-align: right; margin-top: 20px; border-top: 2px solid #16a34a; padding-top: 10px;">
                <h3 style="margin: 10px 0;">Total: ₹${order.total.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
        from: `PotMarket <${process.env.EMAIL_USER}>`,
        to: order.customerEmail,
        subject: `Order Confirmation - #${order.id}`,
        html: emailHtml,
    });
};

module.exports = { sendOrderConfirmationEmail };