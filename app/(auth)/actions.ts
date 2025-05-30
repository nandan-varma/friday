'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { signIn, signUp, signOut } from '@/lib/auth'

export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Login schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

// Signup schema
const signupSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

/**
 * Login action
 */
export async function loginAction(data: { 
  email: string
  password: string 
}): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = loginSchema.parse(data)
    
    const result = await signIn(validatedData.email, validatedData.password)
    
    if (!result.success) {
      return { success: false, error: result.error }
    }
    
  } catch (error) {
    console.error('Login action error:', error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid input data' 
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign in' 
    }
  }
  
  // Redirect to dashboard on success
  // Note: This will throw NEXT_REDIRECT which is normal behavior for Next.js redirects
  redirect('/dashboard')
}

/**
 * Signup action
 */
export async function signupAction(data: { 
  name: string
  email: string
  password: string 
}): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = signupSchema.parse(data)
    
    const result = await signUp(
      validatedData.email, 
      validatedData.password, 
      validatedData.name
    )
    
    if (!result.success) {
      return { success: false, error: result.error }
    }
    
  } catch (error) {
    console.error('Signup action error:', error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid input data' 
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create account' 
    }
  }
  
  // Redirect to dashboard on success
  // Note: This will throw NEXT_REDIRECT which is normal behavior for Next.js redirects
  redirect('/dashboard')
}

/**
 * Logout action
 */
export async function logoutAction(): Promise<void> {
  try {
    await signOut()
  } catch (error) {
    console.error('Logout error (before redirect):', error)
  }
  
  // Redirect to login page after logout
  // Note: This will throw NEXT_REDIRECT which is normal behavior for Next.js redirects
  redirect('/login')
}
