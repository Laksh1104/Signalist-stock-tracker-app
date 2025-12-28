'use client'

import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import {signInWithEmail, signUpWithEmail} from "@/lib/actions/auth.actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const LogIn = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LogInFormData>({
        defaultValues:{
            email:'',
            password:'',
        },
        mode:'onBlur'
        });

    const onSubmit = async (data: LogInFormData) => {
        const result = await signInWithEmail(data);

        if (!result.success) {
            toast.error("Log in failed", {
                description: result.error,
            });
            return;
        }

        router.push("/");
    };

    return (
        <>
            <h1 className={"form-title"}>Log In</h1>

            <form onSubmit={handleSubmit(onSubmit)} className={"space-y-2.5"}>
                <InputField
                    name={"email"}
                    label={"Email"}
                    placeholder={"Enter your email address"}
                    register={register}
                    error={errors.email}
                    validation={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                        }
                    }}
                />

                <InputField
                    name={"password"}
                    label={"Password"}
                    placeholder={"Enter your password"}
                    type={"password"}
                    register={register}
                    error={errors.password}
                    validation={{required: 'Password is required'}}
                />

                <Button type="submit" disabled={isSubmitting} className={"yellow-btn w-full mt-5"}>
                    {isSubmitting ? "Logging in" : "Log In"}
                </Button>
                <FooterLink text={"Don't have an account? "} linkText={"Sign up"} href={"/sign-up"}/>
            </form>
        </>
    )
}
export default LogIn
