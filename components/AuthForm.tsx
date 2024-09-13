"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ITEMS } from '@/constants'
import CustomInput from './CustomInput'
import { authFormSchema } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import SignUp from '@/app/(auth)/sign-up/page'
import { useRouter } from 'next/navigation'
import { getLoggedInUser, signIn, signUp } from '@/lib/actions/user.actions'
import PlaidLink from './PlaidLink'




const AuthForm = ({ type }: { type: string }) => {
  const [user, setuser] = useState(null)
  const [isLoading, setisLoading] = useState(false)

  

  const formSchema = authFormSchema(type);
  const router=useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  })

  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setisLoading(true);
    try {
      //sign up with appwrite
      //create plaid token
      const userData={
        firstName:data.firstName!,
        lastName:data.lastName!,
        address1:data.address1!,
        city:data.city!,
        state:data.state!,
        postalCode:data.postalCode!,
        dateOfBirth:data.dateOfBirth!,
        ssn:data.ssn!,
        email:data.email,
        password:data.password
      }

      if (type === "sign-up") {
        const newUser = await signUp(userData);
        setuser(newUser);
      }
      else if (type === "sign-in") {
        const response = await signIn({
          email:data.email,
          password: data.password
        })

        if(response){
          router.push("/");
        }
      }

    } catch (error) {
      console.log(error);
    } finally {
      setisLoading(false);
    }
  }

  return (
    <section className='auth-form'>
      <header className='flex flex-col gap-5 md:gap-8'>
        <Link href="/" className='flex cursor-pointer items-center gap-1'>
          <Image src="/icons/logo.svg" width={34} height={34} alt='Logo' />
          <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'>MoneyWise</h1>
        </Link>
        <div className='flex flex-col gap-1 md:gap-3'>
          <h1 className='text-24 lg:text-36 font-semibold text-gray-900'>
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}
            <p className="text-16 font-normal text-gray-600">
              {user ? "Link your account to get started" : "Please enter your details"}
            </p>
          </h1>
        </div>
      </header>
      {user ? (
        <div className="flex flex-col gap-4">
          <PlaidLink user={user} variant="primary" />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {type === "sign-up" && (
                <>
                  <div className='flex gap-4'>
                    <CustomInput control={form.control} name="firstName" label="First Name" placeholder="Enter your first name" />
                    <CustomInput control={form.control} name="lastName" label="Last Name" placeholder="Enter your last name" />
                  </div>
                  <CustomInput control={form.control} name="address1" label="Address" placeholder="Enter your street address" />
                  <CustomInput control={form.control} name="city" label="City" placeholder="Enter city" />
                  <div className='flex gap-4'>
                    <CustomInput control={form.control} name="state" label="State" placeholder="Example : NY" />
                    <CustomInput control={form.control} name="postalCode" label="Postal Code" placeholder="5 digit Postal Code" />
                  </div>
                  <div className='flex gap-4'>
                    <CustomInput control={form.control} name="dateOfBirth" label="Date of Birth" placeholder="YYYY-MM-DD" />
                    <CustomInput control={form.control} name="ssn" label="SSN" placeholder="Example : 1234" />
                  </div>
                </>
              )}

              <CustomInput control={form.control} name="email" label="Email" placeholder="Enter your email" />
              <CustomInput control={form.control} name="password" label="Password" placeholder='Enter your password' />

              <div className='flex flex-col gap-4'>

                <Button disabled={isLoading} type="submit" className='form-btn'>
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className='animate-spin' />&nbsp;
                      Loading...
                    </>
                  ) : type === "sign-in" ? "Sign In" : "Sign Up"
                  }
                </Button>
              </div>
            </form>
          </Form>

          <footer className='justify-center flex gap-1'>
            <p className='font-normal text-14 text-gray-600'>{type === "sign-in" ? "Don't have an account?" : "Already have an account?"}</p>
            <Link className='form-link' href={type === "sign-in" ? "/sign-up" : "sign-in"}>{type === "sign-in" ? "Sign Up" : "Sign In"}</Link>
          </footer>
        </>
      )}
    </section>
  )
}

export default AuthForm
