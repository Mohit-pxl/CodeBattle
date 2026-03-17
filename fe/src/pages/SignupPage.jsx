import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Terminal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {z} from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';

const signupSchema = z.object({
    firstName: z.string().min(2, "Minimum character should be 3"),
    emailId: z.string().email("Invalid Email"),
    password: z.string().min(8, "Password is too weak")
  });
  


export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useSelector((state) => state.auth); // Removed error as it wasn't used

    const {
     register,
     handleSubmit,
     formState: { errors },
    } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    console.log("FORM DATA:", data);
    dispatch(registerUser(data));
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
                            placeholder="firstName"
                            className={`input-field w-full ${errors.firstName ? 'border-red-500' : ''}`}
                            {...register("firstName")}
                        />
                        {errors.firstName && <span className="text-red-500 text-xs ml-1">{errors.firstName.message}</span>}
                    </div>

                    <div className="flex flex-col items-start gap-1">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className={`input-field w-full ${errors.emailId ? 'border-red-500' : ''}`}
                            {...register("emailId")}
                        />
                        {errors.emailId && <span className="text-red-500 text-xs ml-1">{errors.emailId.message}</span>}
                    </div>

                    <div className="flex flex-col items-start gap-1">
                        <input
                            type="password"
                            placeholder="Password"
                            className={`input-field w-full ${errors.password ? 'border-red-500' : ''}`}
                            {...register("password")}
                        />
                        {errors.password && <span className="text-red-500 text-xs ml-1">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className={`btn-primary mt-4 w-full ${loading ? 'loading' : ''}`}  disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-[var(--color-slate)] text-[0.9rem]">
                    Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-semibold">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
}
