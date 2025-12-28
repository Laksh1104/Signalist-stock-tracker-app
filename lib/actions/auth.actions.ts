'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async ({email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry}: SignUpFormData) => {
    try{
        const response = await auth.api.signUpEmail({body: { email, password, name: fullName },});

        if(response) {
        await inngest.send({
            name: 'app/user.created',
            data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
        })
        }

        return { success: true, data: response}

    } catch(e) {
        console.log('Sign Up Failed', e);
        return {success: false, error: 'Sign Up Failed'};
    }
}

export const signInWithEmail = async ({email, password, }: LogInFormData) => {
    try{
        const response = await auth.api.signInEmail({body: { email, password },});

        return { success: true, data: response}

    } catch(e) {
        console.log('Log in failed', e);
        return {success: false, error: 'Invalid email or password'};
    }
}

export const signOut = async() => {
    try{
       await auth.api.signOut( {headers: await headers()});
    } catch(e) {
        console.log('Sign out failed', e);
        return {success: false, error: 'Sign out failed'};
    }
}