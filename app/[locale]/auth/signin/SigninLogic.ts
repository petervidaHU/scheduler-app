'use server'
import { signIn } from "@/app/api/auth/[...nextauth]/route";

export const signInLogic = async (formData: FormData, source: string) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
        const result = await signIn('credentials', { email, password, redirectTo: source || '/' });
        if (result && (result as any).url) {
            return { redirect: (result as any).url };
        }
        return result || null;
    } catch (error: any) {
        console.log('/////////////////////', error.message)
        if (error?.message === 'NEXT_REDIRECT') {
            // Signal to the frontend to redirect, not an error
            return { redirect: true };
        }
        // Check for CredentialsSignin error from NextAuth
        if (error?.type === 'CredentialsSignin' || error?.message?.includes('CredentialsSignin')) {
            return { error: 'Invalid email or password.' };
        }
        return { error: error?.message || 'Unknown error' };
    }
}