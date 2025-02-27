"use client";

import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';


export default function SignInPageLogic() {
  const { data: session, status } = useSession();
  console.log('session', session, status)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log('email', email, 'password', password)
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      alert(result.error);
    }
    console.log('result', result)
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Sign In</button>
    </form>
  );
}
