import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

interface AvatarProps {
  avatarUrl?: string
  name: string;
}

export const AvatarDog = ({avatarUrl, name}: AvatarProps) => {
  return (
    <Avatar className="h-10 w-10 border-2 border-white/20">
      <AvatarImage
        src={avatarUrl || `https://robohash.org/1?set=set4`}
        alt={name}
      />
      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold">
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
