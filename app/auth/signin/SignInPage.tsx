"use client";

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { signInLogic } from './SigninLogic';

export default function SignInPageLogic() {
  const { status } = useSession({ required: false });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    // TODO: lient side validation
    // event.preventDefault();
  
  };

  return (<>
    {status !== 'authenticated' ? (
      <form action={signInLogic} onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input name='email' type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input  name='password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Sign In</button>
      </form>
    ) : (
      <div>{success ? 'sucessfully signed in!' : 'you already logged in!'}</div>
    )}
  </>);
}
