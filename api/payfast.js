// Vercel uses 'api' folder for serverless functions
const crypto = require("crypto");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {
    amount,
    item_name,
    return_url = "https://yourapp.com/success",
    cancel_url = "https://yourapp.com/cancel",
    notify_url = "https://yourapp.com/api/payfast", // callback
  } = req.body;

  const paymentData = {
    merchant_id: "10000100", // test id
    merchant_key: "46f0cd694581a",
    amount: parseFloat(amount).toFixed(2),
    item_name,
    return_url,
    cancel_url,
    notify_url,
  };

  // Generate query string
  const query = Object.entries(paymentData)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  // Generate signature (optional for testing)
  const signature = crypto.createHash("md5").update(query).digest("hex");

  // Redirect user to PayFast
  res.status(200).json({
    payment_url: `https://sandbox.payfast.co.za/eng/process?${query}&signature=${signature}`,
  });
}
