import { useThemeStore } from "@/stores/useThemeStore";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface EmojiPickerProps {
  onChange: (value: string) => void;
  className?: string;
}

const EmojiPicker = ({ onChange, className }: EmojiPickerProps) => {
  const { isDark } = useThemeStore();

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "cursor-pointer",
          className
        )}
      >
        <Smile className="size-4" />
      </PopoverTrigger>

      <PopoverContent
        side="right"
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-12"
      >
        <Picker
          theme={isDark ? "dark" : "light"}
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          emojiSize={24}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;