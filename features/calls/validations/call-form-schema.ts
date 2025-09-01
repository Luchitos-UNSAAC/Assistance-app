import { z } from "zod";

export const callFormSchema = z.object({
  email: z.string().email("Debe ser un correo válido").min(1, "El correo es obligatorio"),
  fullName: z.string().min(3, "El nombre completo es obligatorio"),
  dni: z.string().min(8, "El DNI debe tener al menos 8 dígitos"),
  answers: z.record(z.union([z.string().min(1, "Campo obligatorio"), z.array(z.string()).min(1, "Debes elegir al menos una opción")])),
  schedules: z.array(z.string()).min(1, "Debes seleccionar al menos un horario"),
});

export type CallFormSchema = z.infer<typeof callFormSchema>;
