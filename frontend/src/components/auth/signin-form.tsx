import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "@/stores/useAuthStore"

const signInSchema = z.object({
  username: z.string().min(3, { message: "Username is required 3 characters long" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
})
type SignInFormValues = z.infer<typeof signInSchema>
export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) { 
    const {signIn} = useAuthStore();
    const navigate = useNavigate();
    const {register, handleSubmit, formState: { errors, isSubmitting}} = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema)
  });
  const onSubmit = async (data: SignInFormValues) => {
    const {username, password} = data
    await signIn(username, password);
    navigate("/");

  };
   return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
            {/*header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/"
                className="mx-auto block w-fit text-center"
                >
                <img
                  src="/logo.svg"
                  alt="Logo"
                  className="h-12 w-auto"
                />
                </a>
                <h1 className="text-2xl font-bold">
                  Sign in
                </h1>
                <p className="text-muted-foreground text-balance">
                  Welcome! Please enter your details to sign in.
                </p>
              </div>
              {/*Username*/}
              <div className="flex flex-col gap-3">
                <Label htmlFor="username">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="error-message">{errors.username.message}</p>
                )}
              </div>
              {/*Password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>
              
              {/*Sign In Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Sign In
              </Button>
              {/*Sign in Button */}
              <div className="text-center text-sm">
                <p>
                  Have an account?{" "}
                  <a href="/signup" className="underline underline-offset-4">
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover "
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-xs text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
