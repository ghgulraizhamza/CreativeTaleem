import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      amount = '100.00',
      name_first = 'User',
      email_address = 'test@example.com',
    } = req.body;

    // Input validation
    if (!email_address || !email_address.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const payfastUrl = 'https://sandbox.payfast.co.za/eng/process';

    // Use environment variables
    const merchant_id = process.env.PAYFAST_MERCHANT_ID || '10000100';
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY || 'changeme';
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';

    const return_url = 'https://creative-taleem.vercel.app/success';
    const cancel_url = 'https://creative-taleem.vercel.app/cancel';
    const notify_url = 'https://creative-taleem.vercel.app/api/payfast-notify';

    // PayFast data
    const payfastData = {
      merchant_id,
      merchant_key,
      return_url,
      cancel_url,
      notify_url,
      name_first,
      email_address,
      amount: parseFloat(amount).toFixed(2),
      item_name: 'Creative Taleem Payment',
    };

    // Generate signature
    let dataString = '';
    Object.keys(payfastData).forEach(key => {
      if (payfastData[key] !== '') {
        dataString += `${key}=${encodeURIComponent(payfastData[key])}&`;
      }
    });

    dataString = dataString.slice(0, -1);

    if (passphrase) {
      dataString += `&passphrase=${encodeURIComponent(passphrase)}`;
    }

    const signature = crypto.createHash('md5').update(dataString).digest('hex');

    delete payfastData.merchant_key;
    payfastData.signature = signature;

    const formFields = Object.entries(payfastData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n');

    const redirectForm = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting to PayFast...</title>
        </head>
        <body onload="document.forms[0].submit()">
          <div style="text-align: center; padding: 50px;">
            <h2>Redirecting to PayFast...</h2>
            <p>Please wait...</p>
          </div>
          <form action="${payfastUrl}" method="POST">
            ${formFields}
          </form>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(redirectForm);

  } catch (error) {
    console.error('PayFast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
