import { useState, useActionState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, TextInput } from '@mantine/core';
import { createTenancyAction } from '@/app/tenancy/createTenancyAction';
import { FormActionType } from '@/app/types/FormActionType';

const initState: FormActionType = { error: null, data: null };

export default function CreateTenancyLogic() {
    const [ state, action, isPending ] = useActionState(createTenancyAction, initState);
    const { data: session, status } = useSession();
    const [name, setName] = useState('');
    const router = useRouter();

    const validaton = async (event: { preventDefault: () => void; }) => {
        let errorInForm = false;

        if (!name) {
            errorInForm = true;
        }

        if (errorInForm) {
            event.preventDefault();
        }
    }

    const isSignedIn = status === 'authenticated';
    console.log('state in ui', isPending, state);

    return (<>
        {!isSignedIn ? (
            <div>
                <h1>Sign in or sign up to create a tenancy</h1>
                <button onClick={() => router.push('/auth/signin')}>Sign In</button>
                <button onClick={() => router.push('/auth/signup')}>Sign Up</button>
            </div>
        ) : (
            <div>
                <h1>Create New Tenancy</h1>
                <form onSubmit={validaton} action={action}>
                    <TextInput
                        required
                        name="name"
                        label="Name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Button type="submit">Create Tenancy</Button>
                </form>
            </div>)}
    </>);
}