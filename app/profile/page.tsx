import Profile from "@/components/profile";
import {getProfileVolunteer} from "@/features/profile/actions/get-profile-volunteer";

export default async function ProfilePage() {
  const volunteerFull = await getProfileVolunteer()
  if (!volunteerFull) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <p className="text-gray-500">No se encontró tu perfil de usuario</p>
      </div>
    )
  }
  
  return (
    <Profile volunteer={volunteerFull} />
  )
}