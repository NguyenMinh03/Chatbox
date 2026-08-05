import Logout from '@/components/auth/Logout'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@base-ui/react/button';
import React from 'react'
import api from '@/lib/axios';
import {toast} from "sonner";

const ChatAppPage = () => {
  const user = useAuthStore( (s) => s.user);
  const handleOnClick = async () => {
    try {
      await api.get("/users/test", {withCredentials:true});
      toast.success("ok")
    } catch (error) {
      toast.error("error")
      console.error
      
    }
  }
  return (
    <div>
      {user?.username}
     <Logout/>
     <Button onClick={handleOnClick} >test</Button>
    </div>
  )
}

export default ChatAppPage
