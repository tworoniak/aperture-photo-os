import type { Quote, PricingPackage } from '@/types';
import { format } from 'date-fns';

export function generateQuotePDF(quote: Quote, pkg: PricingPackage) {
  const total = quote.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const date = format(new Date(quote.createdAt), 'MMMM d, yyyy');

  const rows = quote.lineItems
    .map((item) => {
      const isDiscount = item.type === 'discount';
      return `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ede8; color: ${isDiscount ? '#16a34a' : '#1a1a1a'}">
          ${item.label}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ede8; text-align: right; font-weight: 500; color: ${isDiscount ? '#16a34a' : '#1a1a1a'}">
          ${item.amount < 0 ? '−$' + Math.abs(item.amount).toLocaleString() : '$' + item.amount.toLocaleString()}
        </td>
      </tr>`;
    })
    .join('');

  const includesList = pkg.includes
    .map((item) => `<li style="margin-bottom: 4px; color: #444">${item}</li>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Quote — ${quote.clientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; background: #fff; padding: 60px; max-width: 680px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid #1a1a1a; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .meta { text-align: right; font-size: 13px; color: #666; line-height: 1.6; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #888; margin-bottom: 12px; }
    .client-name { font-size: 24px; font-weight: 600; }
    .package-box { background: #f9f7f4; border-radius: 10px; padding: 20px; margin-bottom: 8px; }
    .package-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
    .package-desc { font-size: 13px; color: #666; margin-bottom: 12px; }
    .includes-list { list-style: none; font-size: 13px; }
    .includes-list li::before { content: "✓  "; color: #16a34a; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .total-row td { padding: 14px 0; font-size: 18px; font-weight: 700; border-top: 2px solid #1a1a1a; }
    .notes-box { background: #f9f7f4; border-radius: 10px; padding: 16px; font-size: 13px; color: #444; line-height: 1.6; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e2dc; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Apertur</div>
    <div class="meta">
      Quote #${quote.id.slice(-6).toUpperCase()}<br/>
      ${date}<br/>
      Valid for 30 days
    </div>
  </div>

  <div class="section">
    <div class="section-title">Prepared for</div>
    <div class="client-name">${quote.clientName}</div>
  </div>

  <div class="section">
    <div class="section-title">Package</div>
    <div class="package-box">
      <div class="package-name">${pkg.name}</div>
      <div class="package-desc">${pkg.description}</div>
      <ul class="includes-list">${includesList}</ul>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Quote breakdown</div>
    <table>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td>Total</td>
          <td style="text-align: right">$${total.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  ${
    quote.notes
      ? `
  <div class="section">
    <div class="section-title">Notes</div>
    <div class="notes-box">${quote.notes}</div>
  </div>`
      : ''
  }

  <div class="footer">
    This quote is valid for 30 days from the date issued. A deposit is required to secure your date.
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Quote_${quote.clientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
