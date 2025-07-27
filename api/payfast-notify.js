import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const data = req.body;
    
    // Verify signature
    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';

    // Build data string for verification
    let dataString = '';
    Object.keys(data).forEach(key => {
      if (key !== 'signature' && data[key] !== '') {
        dataString += `${key}=${encodeURIComponent(data[key])}&`;
      }
    });

    dataString = dataString.slice(0, -1);

    if (passphrase) {
      dataString += `&passphrase=${encodeURIComponent(passphrase)}`;
    }

    const calculatedSignature = crypto.createHash('md5').update(dataString).digest('hex');

    if (calculatedSignature === data.signature) {
      // Payment verified
      console.log('Payment verified:', data);
      // Handle successful payment here
      res.status(200).send('OK');
    } else {
      console.log('Invalid signature');
      res.status(400).send('Invalid signature');
    }

  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).send('Error');
  }
}