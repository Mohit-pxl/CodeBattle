import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Terminal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';

const loginSchema = z.object({
    emailId: z.string().email("Invalid Email"),
    password: z.string().min(8, "Password is too weak") 
  });
  

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({ resolver: zodResolver(loginSchema) }); // Using renamed schema

  useEffect(() => {
    console.log("Auth state changed:", isAuthenticated);
    if (isAuthenticated) {
      console.log("✅ User logged in successfully");
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    console.log("Submitting login data:", data);
    dispatch(loginUser(data));
  };
 

    return (
        <div className="flex-center min-h-screen pt-20 relative">
            <motion.div
                className="glass-panel p-12 w-full max-w-[420px] text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex-center mb-6">
                    <Terminal color="#E63946" size={48} />
                </div>

                <h2 className="text-[2rem] mb-2">Welcome Back</h2>
                <p className="text-[var(--color-slate)] mb-8">Enter your credentials to continue</p>

                <form className="flex flex-col gap-4 items-stretch" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col items-start gap-1">
                        <input
                            type="emailId"
                            placeholder="Email Address"
                            className={`input-field w-full ${errors.emailId ? 'border-red-500' : ''}`}
                            {...register("emailId", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.emailId && <span className="text-red-500 text-xs ml-1">{errors.emailId.message}</span>}
                    </div>

                    <div className="flex flex-col items-start gap-1">
                        <input
                            type="password"
                            placeholder="Password"
                            className={`input-field w-full ${errors.password ? 'border-red-500' : ''}`}
                            {...register("password", { required: "Password is required" })}
                        />
                        {errors.password && <span className="text-red-500 text-xs ml-1">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="btn-primary mt-4 w-full">
                        Log In
                    </button>
                </form>

                <p className="mt-6 text-[var(--color-slate)] text-[0.9rem]">
                    Don't have an account? <Link to="/signup" className="text-[var(--color-primary)] font-semibold">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
}
