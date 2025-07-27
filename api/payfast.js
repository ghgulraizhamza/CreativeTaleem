// File: /api/payfast.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    amount = '100.00',
    name_first = 'User',
    email_address = 'test@example.com',
  } = req.body;

  const payfastUrl = 'https://sandbox.payfast.co.za/eng/process';

  // Required PayFast merchant details (replace with real sandbox/live details)
  const merchant_id = '10000100'; // your sandbox merchant_id
  const merchant_key = '46f0cd694581a'; // your sandbox merchant_key
  const return_url = 'https://creative-taleem.vercel.app/success';
  const cancel_url = 'https://creative-taleem.vercel.app/cancel';
  const notify_url = 'https://creative-taleem.vercel.app/api/payfast';

  // Construct data string
  const data = new URLSearchParams({
    merchant_id,
    merchant_key,
    amount,
    item_name: 'Test Payment',
    name_first,
    email_address,
    return_url,
    cancel_url,
    notify_url,
  });

  // Redirect to PayFast
  const redirectForm = `
    <html>
      <body onload="document.forms[0].submit()">
        <form action="${payfastUrl}" method="POST">
          ${[...data.entries()]
            .map(([key, val]) => `<input type="hidden" name="${key}" value="${val}" />`)
            .join('\n')}
        </form>
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(redirectForm);
}
