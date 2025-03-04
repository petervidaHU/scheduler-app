'use server'
import { signIn } from "@/app/api/auth/[...nextauth]/route";

export const signInLogic = async (formData: FormData) => {
console.log('form data in signinlogic', formData)
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await signIn('credentials', { email, password, redirectTo: '/' });
    return result || null;
}