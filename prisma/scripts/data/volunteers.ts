import {UserRole, Volunteer, VolunteerStatus, User} from '@prisma/client';

export type NewVolunteerWithUser = Volunteer & { user: User };

export let volunteers: NewVolunteerWithUser[];
volunteers = [
  {
    id: "cme0a14ef000307if8zy60hp9",
    name: "Administrador",
    email: "admin@unsaac.edu.pe",
    phone: "+5191919191919",
    address: "Cusco, Peru",
    birthday: new Date("2025-08-06T13:03:00.000Z"),
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: "initial_data",
    updatedBy: null,
    deletedBy: null,
    user: {
      id: "cme09w21z000007if6wg7fxfk",
      email: "admin@unsaac.edu.pe",
      password: "123456",
      name: "Administrador",
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      volunteerId: "cme0a14ef000307if8zy60hp9",
      deletedAt: null,
      createdBy: "initial_data",
      updatedBy: null,
      deletedBy: null,
      dni: null,
      avatar: null
    }
  },
  {
    id: "cme0volun0000307if8zy60hp3",
    name: "Carlos Mendoza",
    email: "manager2@unsaac.edu.pe",
    phone: "+5193737373737",
    address: "Cusco, Peru",
    birthday: new Date("1995-11-20T15:30:00.000Z"),
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "initial_data",
    updatedBy: null,
    deletedBy: null,
    deletedAt: null,
    user: {
      id: "cme0user0000307if8zy60hp4",
      email: "manager2@unsaac.edu.pe",
      password: "123456", // ⚠️ Hash in production
      name: "Carlos Mendoza",
      role: UserRole.MANAGER,
      createdAt: new Date(),
      updatedAt: new Date(),
      volunteerId: "cme0volun0000307if8zy60hp3",
      createdBy: "initial_data",
      updatedBy: null,
      deletedBy: null,
      dni: null,
      avatar: null,
      deletedAt: null
    }
  },
  {
    id: "cme0volun0000307if8zy60hp1",
    name: "María López",
    email: "voluntario5@unsaac.edu.pe",
    phone: "+5192828282828",
    address: "Cusco, Peru",
    birthday: new Date("1999-04-12T10:00:00.000Z"),
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "initial_data",
    updatedBy: null,
    deletedBy: null,
    deletedAt: null,
    user: {
      id: "cme0user0000307if8zy60hp2",
      email: "voluntario5@unsaac.edu.pe",
      password: "123456", // ⚠️ Hash in production
      name: "María López",
      role: UserRole.VOLUNTEER,
      createdAt: new Date(),
      updatedAt: new Date(),
      volunteerId: "cme0volun0000307if8zy60hp1",
      createdBy: "initial_data",
      updatedBy: null,
      deletedBy: null,
      dni: null,
      avatar: null,
      deletedAt: null
    }
  },
];