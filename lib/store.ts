import { create } from "zustand"

export interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  birthday: string
  status: "Active" | "Inactive"
  attendances: Attendance[]
}

export interface Attendance {
  id: string
  volunteerId: string
  date: string
  status: "Present" | "Absent" | "Justified"
}

interface VolunteerStore {
  volunteers: Volunteer[]
  addVolunteer: (volunteer: Omit<Volunteer, "id" | "attendances">) => void
  updateVolunteer: (id: string, volunteer: Partial<Volunteer>) => void
  deleteVolunteer: (id: string) => void
  getVolunteer: (id: string) => Volunteer | undefined
}

interface AttendanceStore {
  attendances: Attendance[]
  addAttendance: (attendance: Omit<Attendance, "id">) => void
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void
  deleteAttendance: (id: string) => void
  getAttendancesByVolunteer: (volunteerId: string) => Attendance[]
  getAttendancesByDate: (date: string) => Attendance[]
}

// Mock data
const mockVolunteers: Volunteer[] = [
  {
    id: "1",
    name: "María López",
    email: "maria@unsaac.edu",
    phone: "+51 987654321",
    address: "Calle Los Perros 123",
    birthday: "2000-05-15",
    status: "Active",
    attendances: [],
  },
  {
    id: "2",
    name: "José Ramírez",
    email: "jose@unsaac.edu",
    phone: "+51 912345678",
    address: "Av. Caninos 456",
    birthday: "1999-10-20",
    status: "Active",
    attendances: [],
  },
  {
    id: "3",
    name: "Ana García",
    email: "ana@unsaac.edu",
    phone: "+51 998877665",
    address: "Jr. Mascotas 789",
    birthday: "2001-03-08",
    status: "Active",
    attendances: [],
  },
  {
    id: "4",
    name: "Carlos Mendoza",
    email: "carlos@unsaac.edu",
    phone: "+51 955443322",
    address: "Av. Universitaria 321",
    birthday: "1998-12-12",
    status: "Inactive",
    attendances: [],
  },
]

const mockAttendances: Attendance[] = [
  { id: "1", volunteerId: "1", date: "2025-08-01", status: "Present" },
  { id: "2", volunteerId: "2", date: "2025-08-01", status: "Present" },
  { id: "3", volunteerId: "3", date: "2025-08-01", status: "Absent" },
  { id: "4", volunteerId: "1", date: "2025-08-02", status: "Justified" },
  { id: "5", volunteerId: "2", date: "2025-08-02", status: "Present" },
  { id: "6", volunteerId: "4", date: "2025-08-02", status: "Absent" },
  { id: "7", volunteerId: "1", date: "2025-08-03", status: "Present" },
  { id: "8", volunteerId: "3", date: "2025-08-03", status: "Present" },
]

export const useVolunteerStore = create<VolunteerStore>((set, get) => ({
  volunteers: mockVolunteers,
  addVolunteer: (volunteer) => {
    const newVolunteer: Volunteer = {
      ...volunteer,
      id: Date.now().toString(),
      attendances: [],
    }
    set((state) => ({
      volunteers: [...state.volunteers, newVolunteer],
    }))
  },
  updateVolunteer: (id, updatedVolunteer) => {
    set((state) => ({
      volunteers: state.volunteers.map((v) => (v.id === id ? { ...v, ...updatedVolunteer } : v)),
    }))
  },
  deleteVolunteer: (id) => {
    set((state) => ({
      volunteers: state.volunteers.filter((v) => v.id !== id),
    }))
  },
  getVolunteer: (id) => {
    return get().volunteers.find((v) => v.id === id)
  },
}))

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  attendances: mockAttendances,
  addAttendance: (attendance) => {
    const newAttendance: Attendance = {
      ...attendance,
      id: Date.now().toString(),
    }
    set((state) => ({
      attendances: [...state.attendances, newAttendance],
    }))
  },
  updateAttendance: (id, updatedAttendance) => {
    set((state) => ({
      attendances: state.attendances.map((a) => (a.id === id ? { ...a, ...updatedAttendance } : a)),
    }))
  },
  deleteAttendance: (id) => {
    set((state) => ({
      attendances: state.attendances.filter((a) => a.id !== id),
    }))
  },
  getAttendancesByVolunteer: (volunteerId) => {
    return get().attendances.filter((a) => a.volunteerId === volunteerId)
  },
  getAttendancesByDate: (date) => {
    return get().attendances.filter((a) => a.date === date)
  },
}))
