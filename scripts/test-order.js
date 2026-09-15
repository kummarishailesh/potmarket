(async () => {
  try {
    const body = {
      customerEmail: 'test@example.com',
      items: [{ id: 'p1', name: 'Test Pot', price: 199, quantity: 2 }],
      total: 398,
      paymentMethod: 'card'
    };

    const createRes = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const createJson = await createRes.json();
    console.log('CREATE RESPONSE:', createJson);

    const orderId = createJson.orderId;
    if (!orderId) {
      console.error('No orderId returned, aborting verify step.');
      process.exit(1);
    }

    const verifyRes = await fetch(`http://localhost:3001/api/orders/${orderId}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: 'TXN_TEST' })
    });
    const verifyJson = await verifyRes.json();
    console.log('VERIFY RESPONSE:', verifyJson);
  } catch (err) {
    console.error('Error during test-order:', err);
    process.exit(1);
  }
})();
