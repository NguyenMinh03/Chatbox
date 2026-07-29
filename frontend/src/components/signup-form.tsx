import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
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
                  Create an account
                </h1>
                <p className="text-muted-foreground text-balance">
                  Welcome! please enter your details to create an account.
                </p>
              </div>
              {/*Name*/}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                  />
                </div>
              </div>
              {/*Username*/}
              <div className="flex flex-col gap-3">
                <label htmlFor="username" className="block text-sm">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                />
              </div>
              {/*Email */}
              <div className="flex flex-col gap-3">
                <label htmlFor="email" className="block text-sm">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
              {/*Password */}
              <div className="flex flex-col gap-3">
                <label htmlFor="password" className="block text-sm">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                />
              </div>
              {/*Sign Up Button */}
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
              {/*Sign in Button */}
              <div className="text-center text-sm">
                <p>
                  Already have an account?{" "}
                  <a href="/signin" className="underline underline-offset-4">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholderSignUp.png"
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
