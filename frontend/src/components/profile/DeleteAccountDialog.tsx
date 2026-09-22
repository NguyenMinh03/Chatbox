import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";
import { useUserStore } from "@/stores/useUserStore";

type Step = "warning" | "confirm";

const DeleteAccountDialog = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("warning");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { deleteAccount } = useUserStore();
  const navigate = useNavigate();

  const resetState = () => {
    setStep("warning");
    setPassword("");
    setSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetState();
  };

  const handleFinalDelete = async () => {
    if (!password) return;

    setSubmitting(true);
    const success = await deleteAccount({ password });
    setSubmitting(false);

    if (success) {
      setOpen(false);
      navigate("/signin");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            className="w-full"
          />
        }
      >
        Delete Account
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] border-none">
        {step === "warning" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete your account?
              </DialogTitle>
              <DialogDescription>
                This permanently deletes your account, your friends list, and any pending
                friend requests. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setStep("confirm")}
              >
                Yes, delete my account
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Are you absolutely sure?
              </DialogTitle>
              <DialogDescription>
                Enter your password to permanently confirm the deletion. There is no way to
                recover your account after this.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="deleteAccountPassword">Password</Label>
              <Input
                id="deleteAccountPassword"
                type="password"
                autoComplete="current-password"
                className="glass-light border-border/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("warning")}
                disabled={submitting}
              >
                Go back
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!password || submitting}
                onClick={handleFinalDelete}
              >
                {submitting ? "Deleting..." : "Delete My Account"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
