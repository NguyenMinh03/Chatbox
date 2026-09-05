import { Heart } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserStore } from "@/stores/useUserStore";

const personalInfoSchema = z.object({
  displayName: z.string().min(1, { message: "Display name is required" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  email: z.email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  bio: z
    .string()
    .max(500, { message: "Introduction must be under 500 characters" })
    .optional(),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

type Props = {
  userInfo: User | null;
};

const PersonalInfoForm = ({ userInfo }: Props) => {
  const { updateProfile } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    values: userInfo
      ? {
          displayName: userInfo.displayName ?? "",
          username: userInfo.username ?? "",
          email: userInfo.email ?? "",
          phone: userInfo.phone ?? "",
          bio: userInfo.bio ?? "",
        }
      : undefined,
  });

  if (!userInfo) return null;

  const onSubmit = async (data: PersonalInfoValues) => {
    await updateProfile(data);
  };

  return (
    <Card className="glass-strong border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="size-5 text-primary" />
          User Information
        </CardTitle>
        <CardDescription>Update detail your information</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                type="text"
                className="glass-light border-border/30"
                {...register("displayName")}
              />
              {errors.displayName && (
                <p className="error-message">{errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">User Name</Label>
              <Input
                id="username"
                type="text"
                className="glass-light border-border/30"
                {...register("username")}
              />
              {errors.username && (
                <p className="error-message">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="glass-light border-border/30"
                {...register("email")}
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="text"
                className="glass-light border-border/30"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="error-message">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Introduction</Label>
            <Textarea
              id="bio"
              rows={3}
              className="glass-light border-border/30 resize-none"
              {...register("bio")}
            />
            {errors.bio && <p className="error-message">{errors.bio.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full md:w-auto bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
};

export default PersonalInfoForm;
