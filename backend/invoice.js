import PDFDocument from 'pdfkit';
import db from './database.js';

const invoiceImage = async source => {
    if (!source) return null;
    try {
        if (source.startsWith('data:image/')) return Buffer.from(source.split(',')[1], 'base64');
        const response = await fetch(source, { signal: AbortSignal.timeout(5000) });
        return response.ok ? Buffer.from(await response.arrayBuffer()) : null;
    } catch { return null; }
};

const orderPaymentStatus = order => order.paymentStatus || (order.paymentVerified ? 'Paid' : 'Pending');
const orderStatus = order => order.orderStatus || order.status || 'Pending';

export const invoicePdf = async order => {
    const document = new PDFDocument({ size: 'A4', margin: 42, bufferPages: true });
    const chunks = []; document.on('data', chunk => chunks.push(chunk));
    const completed = new Promise((resolve, reject) => { document.on('end', () => resolve(Buffer.concat(chunks))); document.on('error', reject); });
    const teal = '#0f766e'; const ink = '#17212b'; const muted = '#64727d'; const line = '#dfe7e4';
    document.roundedRect(42, 42, 38, 38, 8).fill('#e8b34b');
    document.fillColor(ink).fontSize(20).font('Helvetica-Bold').text('P', 42, 50, { width: 38, align: 'center' });
    document.fillColor(teal).fontSize(24).font('Helvetica-Bold').text('POTMARKET', 92, 48);
    document.fillColor(muted).fontSize(8).font('Helvetica').text('HANDCRAFTED PLANTERS AND POTS', 94, 76);
    document.fillColor(ink).fontSize(20).text('INVOICE', 390, 46, { align: 'right' });
    document.fillColor(muted).fontSize(9).font('Helvetica').text(`Order ${order.id}`, 390, 73, { align: 'right' }).text(`Placed ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}`, 390, 87, { align: 'right' });
    document.moveTo(42, 112).lineTo(553, 112).strokeColor(line).stroke();
    document.fillColor(ink).fontSize(10).font('Helvetica-Bold').text('BILL TO', 42, 130).text('PAYMENT', 310, 130);
    document.font('Helvetica').fillColor(muted).fontSize(10).text(`${order.customerName || 'Guest'}\n${order.customerEmail || 'Not provided'}\n${order.shippingAddress?.phone || ''}`, 42, 148, { width: 220, lineGap: 3 });
    document.text(`${order.paymentMethod || 'Not provided'}\n${orderPaymentStatus(order)}\nOrder status: ${orderStatus(order)}`, 310, 148, { width: 200, lineGap: 3 });
    const tableTop = 220; document.roundedRect(42, tableTop, 511, 28, 4).fill(teal); document.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text('ITEM', 112, tableTop + 9).text('QTY', 375, tableTop + 9).text('PRICE', 462, tableTop + 9, { width: 70, align: 'right' });
    let y = tableTop + 28;
    for (const item of order.items || []) {
        if (y > 700) { document.addPage(); y = 50; }
        const product = db.getProductById(item.id); const image = await invoiceImage(product?.image || item.image);
        document.rect(42, y, 511, 70).fill(y % 2 ? '#f8faf9' : '#ffffff');
        if (image) { try { document.image(image, 52, y + 5, { fit: [50, 60], align: 'center', valign: 'center' }); } catch { /* Unsupported product images should not invalidate the invoice. */ } }
        document.fillColor(ink).font('Helvetica-Bold').fontSize(10).text(item.name || product?.name || 'Product', 112, y + 17, { width: 245 });
        document.fillColor(muted).font('Helvetica').fontSize(9).text(`Product ID: ${item.id}`, 112, y + 35);
        document.fillColor(ink).fontSize(10).text(String(item.quantity || 1), 375, y + 25);
        document.font('Helvetica-Bold').text(`INR ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}`, 430, y + 25, { width: 105, align: 'right' });
        document.moveTo(42, y + 70).lineTo(553, y + 70).strokeColor(line).stroke(); y += 70;
    }
    y += 22; document.fillColor(muted).font('Helvetica').fontSize(10).text('TOTAL', 370, y); document.fillColor(ink).font('Helvetica-Bold').fontSize(16).text(`INR ${Number(order.total || 0).toFixed(2)}`, 430, y - 3, { width: 105, align: 'right' });
    if (order.shippingAddress) { y += 55; document.fillColor(ink).fontSize(10).text('DELIVERY ADDRESS', 42, y).font('Helvetica').fillColor(muted).text(`${order.shippingAddress.name || ''}\n${order.shippingAddress.address || ''}\n${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.pincode || ''}`, 42, y + 18, { width: 260, lineGap: 3 }); }
    document.fillColor(muted).fontSize(9).text('Thank you for shopping with PotMarket.', 42, 760); document.end(); return completed;
};