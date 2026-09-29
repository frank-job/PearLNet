async function testSignup() {
  const res = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: 'Test User 2', 
      email: 'test2@example.com', 
      password: 'Password123',
      terms: true 
    }),
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testSignup().catch(console.error);