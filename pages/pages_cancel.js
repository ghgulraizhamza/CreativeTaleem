export default function Cancel() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Payment Cancelled ❌</h1>
      <p>Your payment was cancelled.</p>
      <button onClick={() => window.location.href = '/'}>
        Try Again
      </button>
    </div>
  );
}