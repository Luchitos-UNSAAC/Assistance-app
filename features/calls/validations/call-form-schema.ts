import { z } from "zod";

export const callFormSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es obligatorio"),
  email: z.string().email("Debe ser un correo válido").min(1, "El correo es obligatorio"),
  dni: z.string().min(8, "El DNI debe tener al menos 8 dígitos"),
  phoneNumber: z.string().min(9, "El número de celular debe tener al menos 9 dígitos"),
  address: z.string().min(5, "La dirección es obligatoria"),
  birthDate: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  answers: z.record(z.union([z.string().min(1, "Campo obligatorio"), z.array(z.string()).min(1, "Debes elegir al menos una opción")])),
  schedules: z.array(z.string()).min(1, "Debes seleccionar al menos un horario"),
});

export type CallFormSchema = z.infer<typeof callFormSchema>;
