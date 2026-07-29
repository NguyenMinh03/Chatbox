import {create} from "zustand"
import {toast} from "sonner"
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
export const useAuthStore = create<AuthState>((set,get) => ({
    accessToken: null,
    user: null,
    loading: false,
    clearState :() => {
        set({accessToken:null, user: null, loading: false })
    },
    signUp: async (username, password, email, firstName, lastName) => {
        try {
            set({loading: true})
            // call the API to sign up the user
            await authService.signUp(username, password, email, firstName, lastName);
            toast.success("Sign up successful")
        } catch (error) {
            console.error("Failed to sign up", error)
            toast.error("Failed to sign up")
        }
        finally {
            set({loading: false})
        }
    },
    signIn: async (username, password) =>{
        try {
            set({loading: true})
            const {accessToken} = await authService.signIn(username, password);
            set({accessToken});
            await get().fetchMe();
            toast.success("Welcome back to chat box")
        }
        catch(error) {
            console.error(error);
            toast.error("Fail to sign in") 

        }
        finally {
            set({loading:false});
        }
    },
    

    signOut: async() => {
        try {
            get().clearState();
            await authService.signOut();
            toast.success("SignOut success")
        } catch (error) {
            console.error(error)
            toast.error("fail to signout ")
        }
    },
    fetchMe: async () => {
        try {
            set({loading:true});
            const user = await authService.fetchMe();
            set({user});
        } catch (error) {
            console.error(error);
            set({user:null, accessToken:null});
            toast.error("fail when take user data")
        }
        finally {
            set({loading:false})
        }
    }
}));
