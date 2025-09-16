import ManagersList from "@/features/managers/components/manager-list";
import {getActiveManagers} from "@/features/managers/actions/get-active-managers";
import {Attendance} from "@/lib/store";
import {getVolunteerFreeToBeManager} from "@/features/managers/actions/get-volunteer-free-to-be-manager";

export default async function ManagersPage() {
  const activeManagers = await getActiveManagers();
  const volunteers = await getVolunteerFreeToBeManager();
  const attendancesAll: Attendance[]  = []
  activeManagers.forEach((manager) => {
    manager.attendances.forEach((attendance) => {
      attendancesAll.push(attendance)
    })
  })
  
  return (
    <ManagersList
      volunteers={volunteers}
      managers={activeManagers}
      attendances={attendancesAll}
    />
  );
}