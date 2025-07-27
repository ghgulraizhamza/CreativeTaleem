import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    amount: '100.00',
    name_first: '',
    email_address: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/payfast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const html = await response.text();
        document.open();
        document.write(html);
        document.close();
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '50px auto',
      padding: '30px',
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #ddd',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        Creative Taleem Payment
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            First Name:
          </label>
          <input
            type="text"
            name="name_first"
            value={formData.name_first}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            placeholder="Enter your first name"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email Address:
          </label>
          <input
            type="email"
            name="email_address"
            value={formData.email_address}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            placeholder="Enter your email"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Amount (ZAR):
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
            step="0.01"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            placeholder="Enter amount"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? 'Processing...' : 'Pay with PayFast'}
        </button>
      </form>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        fontSize: '14px',
        color: '#666'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Payment Information:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Secure payment powered by PayFast</li>
          <li>Test mode - no real money will be charged</li>
          <li>Use test cards for sandbox payments</li>
        </ul>
      </div>
    </div>
  );
}
