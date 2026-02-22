import React from 'react'
import { useForm } from 'react-hook-form';

const Signup = () => {

  const {register,handleSubmit,formState: { errors }, } = useForm();

  return (
    <>
    <form onSubmit={handleSubmit((data)=>console.log(data))}>
      <input {...register('firstName')} placeholder='Enter your first name'></input>
      <input {...register('email')} placeholder='Enter Email'></input>
      <input {...register('password')} placeholder='Enter your password'></input>
      <button type='submit' className='btn btn-lg'>Submit</button>
    </form>
      
    </>
  )
}

export default Signup
