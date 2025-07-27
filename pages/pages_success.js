export default function Success() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Payment Successful! ✅</h1>
      <p>Thank you for your payment.</p>
      <button onClick={() => window.location.href = '/'}>
        Go Home
      </button>
    </div>
  );
}