import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Terminal } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function SignupPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("Signup Data:", data);
        // Add signup logic here
    };

    return (
        <div className="flex-center min-h-screen pt-20 relative">
            <motion.div
                className="glass-panel p-12 w-full max-w-[420px] text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex-center mb-6">
                    <Terminal color="#E63946" size={48} />
                </div>

                <h2 className="text-[2rem] mb-2">Create Account</h2>
                <p className="text-[var(--color-slate)] mb-8">Join the ultimate code battle platform</p>

                <form className="flex flex-col gap-4 items-stretch" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col items-start gap-1">
                        <input
                            type="text"
                            placeholder="Username"
                            className={`input-field w-full ${errors.username ? 'border-red-500' : ''}`}
                            {...register("username", { required: "Username is required" })}
                        />
                        {errors.username && <span className="text-red-500 text-xs ml-1">{errors.username.message}</span>}
                    </div>

                    <div className="flex flex-col items-start gap-1">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className={`input-field w-full ${errors.email ? 'border-red-500' : ''}`}
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && <span className="text-red-500 text-xs ml-1">{errors.email.message}</span>}
                    </div>

                    <div className="flex flex-col items-start gap-1">
                        <input
                            type="password"
                            placeholder="Password"
                            className={`input-field w-full ${errors.password ? 'border-red-500' : ''}`}
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters"
                                }
                            })}
                        />
                        {errors.password && <span className="text-red-500 text-xs ml-1">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="btn-primary mt-4 w-full">
                        Create Account
                    </button>
                </form>

                <p className="mt-6 text-[var(--color-slate)] text-[0.9rem]">
                    Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-semibold">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
}
