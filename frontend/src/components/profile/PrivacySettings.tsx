import { Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChangePasswordDialog from "./ChangePasswordDialog";
import NotificationSettingsDialog from "./NotificationSettingsDialog";
import ReportUserDialog from "./ReportUserDialog";

const PrivacySettings = () => (
  <Card className="glass-strong border-border/30">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        Privacy & Security
      </CardTitle>
      <CardDescription>
        Manage your privacy and security settings
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">
      <div className="space-y-4">
        <ChangePasswordDialog />

        <NotificationSettingsDialog />

        <ReportUserDialog />
      </div>

      <div className="pt-4 border-t border-border/30">
        <h4 className="font-medium mb-3 text-destructive">Danger Zone</h4>
        <Button
          variant="destructive"
          className="w-full"
        >
          Delete Account
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default PrivacySettings;