import ManagersList from "@/features/managers/components/manager-list";
import {getActiveManagers} from "@/features/managers/actions/get-active-managers";
import {Attendance} from "@/lib/store";

export default async function ManagersPage() {
  const activeManagers = await getActiveManagers();
  const attendancesAll: Attendance[]  = []
  
  // Join all the attendances for stats
  activeManagers.forEach((manager) => {
    manager.attendances.forEach((attendance) => {
      attendancesAll.push(attendance)
    })
  })
  
  return (
    <ManagersList
      managers={activeManagers}
      attendances={attendancesAll}
    />
  );
}