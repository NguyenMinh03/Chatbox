import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useFriendStore } from "@/stores/useFriendStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { reportService } from "@/services/reportService";
import { REPORT_REASONS, type ReportReason } from "@/types/report";
import type { User } from "@/types/user";
import UserAvatar from "@/components/chat/UserAvatar";

interface ReportFormValues {
  username: string;
  reason: ReportReason | "";
  details: string;
}

const ReportUserDialog = () => {
  const [open, setOpen] = useState(false);
  const [isFound, setIsFound] = useState<boolean | null>(null);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [selfReportError, setSelfReportError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { searchByUsername } = useFriendStore();
  const { user: currentUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportFormValues>({
    defaultValues: { username: "", reason: "", details: "" },
  });

  const usernameValue = watch("username");

  const resetAll = () => {
    reset();
    setIsFound(null);
    setFoundUser(null);
    setSelfReportError(false);
  };

  const handleSearch = handleSubmit(async (data) => {
    const username = data.username.trim();
    if (!username) return;

    setSearching(true);
    setSelfReportError(false);

    try {
      const result = await searchByUsername(username);

      if (!result) {
        setIsFound(false);
        setFoundUser(null);
        return;
      }

      if (result._id === currentUser?._id) {
        setIsFound(false);
        setFoundUser(null);
        setSelfReportError(true);
        return;
      }

      setFoundUser(result);
      setIsFound(true);
    } catch (error) {
      console.error("Fail when searching user to report", error);
      setIsFound(false);
      setFoundUser(null);
    } finally {
      setSearching(false);
    }
  });

  const handleSubmitReport = handleSubmit(async (data) => {
    if (!foundUser || !data.reason) return;

    setSubmitting(true);

    try {
      const { message } = await reportService.createReport({
        reportedUserId: foundUser._id,
        reason: data.reason,
        details: data.details.trim() || undefined,
      });

      toast.success(message || "Report submitted");
      resetAll();
      setOpen(false);
    } catch (error) {
      console.error("Fail when submitting report", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to submit report";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetAll();
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-start glass-light border-border/30 hover:text-destructive"
          />
        }
      >
        <Flag className="size-4 mr-2" />
        Report a User
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Report a User</DialogTitle>
        </DialogHeader>

        {!isFound && !foundUser && (
          <form
            onSubmit={handleSearch}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label
                htmlFor="report-username"
                className="text-sm font-semibold"
              >
                Find by Username
              </Label>
              <Input
                id="report-username"
                placeholder="Type Username..."
                className="glass border-border/50 focus:border-primary/50 transition-smooth"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && (
                <p className="error-message">{errors.username.message}</p>
              )}
              {isFound === false && !selfReportError && (
                <p className="error-message">
                  Could not find <span className="font-semibold">@{usernameValue}</span>
                </p>
              )}
              {selfReportError && (
                <p className="error-message">You cannot report yourself</p>
              )}
            </div>

            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 glass"
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button
                type="submit"
                disabled={searching || !usernameValue?.trim()}
                className="flex-1"
              >
                {searching ? (
                  "Searching..."
                ) : (
                  <>
                    <Search className="size-4 mr-2" /> Search
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {isFound && foundUser && (
          <form
            onSubmit={handleSubmitReport}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 rounded-lg glass-light border border-border/30 p-3">
              <UserAvatar
                type="chat"
                name={foundUser.displayName}
                avatarUrl={foundUser.avatarUrl}
              />
              <div>
                <p className="text-sm font-semibold">{foundUser.displayName}</p>
                <p className="text-xs text-muted-foreground">@{foundUser.username}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="reason"
                className="text-sm font-semibold"
              >
                Reason
              </Label>
              <select
                id="reason"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                {...register("reason", { required: "Please choose a reason" })}
              >
                <option value="">Select a reason...</option>
                {REPORT_REASONS.map(({ value, label }) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
              {errors.reason && <p className="error-message">{errors.reason.message}</p>}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="details"
                className="text-sm font-semibold"
              >
                Details (optional)
              </Label>
              <Textarea
                id="details"
                rows={3}
                placeholder="Add any context that would help us review this..."
                className="glass border-border/50 focus:border-primary/50 transition-smooth resize-none"
                {...register("details")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="flex-1 glass"
                onClick={() => {
                  setIsFound(null);
                  setFoundUser(null);
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportUserDialog;
