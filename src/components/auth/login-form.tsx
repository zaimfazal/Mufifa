'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('password', values.password)
      
      const result = await signIn(formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        router.push('/dashboard')
        router.refresh()
      }
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto glass-panel border-accent/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center neon-text-green">
          Login
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter the email and password you used to register in μFIFA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} className="bg-background/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="https://mufifa.mulearn.org/forgot-password"
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        className="bg-background/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 neon-border-green transition-all" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border/50 pt-4 mt-4">
        <p className="text-sm text-muted-foreground">
          If not registered, <Link href="https://mufifa.mulearn.org/register" className="text-primary hover:underline">register here</Link>.
        </p>
      </CardFooter>
    </Card>
  )
}
