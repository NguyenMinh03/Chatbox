import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriendStore } from "@/stores/useFriendStore";
import ReceivedRequests from "./ReceivedRequests";
import SentRequests from "./SentRequests";


interface FriendRequestDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const FriendRequestDialog = ({ open, setOpen }: FriendRequestDialogProps) => {
    const [tab, setTab] = useState("received");
    const { getAllFriendRequests } = useFriendStore();
    useEffect(() => {
    const loadRequest = async () => {
      try {
        await getAllFriendRequests();
      } catch (error) {
        console.error("Fail when load requests", error);
      }
    };
    loadRequest();
  }, []);
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Friend Requests</DialogTitle>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="w-full gap-6"
        >
          <TabsList className="w-full rounded-full bg-muted p-1">
            <TabsTrigger
              value="received"
              className="rounded-full data-active:border-primary/50"
            >
              Received
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="rounded-full data-active:border-primary/50"
            >
              Sent
            </TabsTrigger>
          </TabsList>
          <TabsContent value="received">
            <ReceivedRequests/>
          </TabsContent>

          <TabsContent value="sent">
            <SentRequests/>
          </TabsContent>
        </Tabs>
      </DialogContent>
     </Dialog>
  )
}

export default FriendRequestDialog
