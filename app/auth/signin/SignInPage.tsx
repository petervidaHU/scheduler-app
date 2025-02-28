"use client";

import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPageLogic() {
  const router = useRouter();
  const { data: session, status } = useSession();
  // console.log('session in signin page::', session, status)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log('email', email, 'password', password)
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      alert(result.error);
    }
    console.log('result', result)
    setSuccess(true);
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (<>
    {status !== 'authenticated' ? (
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
    ) : (
      <div>{success ? 'sucessfully signed in!' : 'you already logged in!'}</div>
    )}
  </>);
}
