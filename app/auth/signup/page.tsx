"use client";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

export default function SignUpPage() {
  async function handleSignUp(formData: FormData) {
    "use server";
    
    // Add your user creation logic here
    const email = formData.get("email");
    const password = await hash(formData.get("password") as string, 12);
    
    // Save user to database (mock example)
    console.log({ email, password });
    
    redirect("/signin");
  }

  return (
    <form action={handleSignUp}>
      <div>
        <label>Email</label>
        <input name="email" type="email" required />
      </div>
      <div>
        <label>Password</label>
        <input name="password" type="password" required />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
}