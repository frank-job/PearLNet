async function testLogin() {
  const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: 'test2@example.com',
      password: 'Password123',
      redirect: 'false',
      callbackUrl: 'http://localhost:3000/PearLNet',
    }),
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response text:', text);
}

testLogin().catch(console.error);