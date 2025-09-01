"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CallQuestion, CallSchedule } from "@prisma/client";
import {callFormSchema, CallFormSchema} from "@/features/calls/validations/call-form-schema";

type QuestionType = "short" | "paragraph" | "multiple" | "checkbox";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

interface QuestionsToFillProps {
  questions: CallQuestion[];
  schedules: CallSchedule[];
}

export default function QuestionsToFill({ questions, schedules }: QuestionsToFillProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CallFormSchema>({
    resolver: zodResolver(callFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      dni: "",
      answers: {},
      schedules: [],
    },
  });
  
  const answers = watch("answers");
  const selectedSchedules = watch("schedules");
  
  // Prisma -> Form mapping
  const mapFromPrisma = (q: CallQuestion): Question => ({
    id: q.id,
    text: q.question,
    type:
      q.type === "TEXT"
        ? "paragraph"
        : q.type === "NUMBER"
          ? "short"
          : q.type === "MULTIPLE"
            ? "multiple"
            : "checkbox",
    options: Array.isArray(q.options) ? q.options.filter((opt): opt is string => typeof opt === "string") : [],
  });
  
  const localQuestions: Question[] = questions.map(mapFromPrisma);
  
  const onSubmit = (data: CallFormSchema) => {
    console.log("✅ Datos validados:", data);
    console.log("Respuestas formateadas:", formattedAnswers);
    // Aquí puedes enviar 'data' a tu servidor o manejarlo como necesites
  };
  
  const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
    const question = localQuestions.find((q) => q.id === questionId);
    if (!question) return null;
    return {
      questionId,
      answer: value,
      type: question.type,
    };
  });
  
  const formatSchedule = (s: CallSchedule) => {
    if (s.onDate) {
      return `${new Date(s.onDate).toLocaleDateString()} - ${new Date(s.startTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} a ${new Date(s.endTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return `${s.dayOfWeek} - ${new Date(s.startTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} a ${new Date(s.endTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-8 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Formulario</h1>
      
      {/* Correo institucional */}
      <Card>
        <CardHeader>
          <CardTitle>1. Correo institucional</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="010101@unsaac.edu.pe" {...register("email")} />
          {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>}
        </CardContent>
      </Card>
      
      {/* Nombre completo */}
      <Card>
        <CardHeader>
          <CardTitle>2. Nombre Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="JUANITO QUISPE QUISPE" {...register("fullName")} />
          {errors.fullName && <p className="mt-1 text-red-500 text-sm">{errors.fullName.message}</p>}
        </CardContent>
      </Card>
      
      {/* DNI */}
      <Card>
        <CardHeader>
          <CardTitle>3. DNI</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="76767676" type="number" {...register("dni")} />
          {errors.dni && <p className="mt-1 text-red-500 text-sm">{errors.dni.message}</p>}
        </CardContent>
      </Card>
      
      {/* Preguntas dinámicas */}
      {localQuestions.map((q, index) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle>{index + 5}. {q.text}</CardTitle>
          </CardHeader>
          <CardContent>
            {q.type === "paragraph" && (
              <Textarea
                placeholder="Escribe un párrafo..."
                value={(answers[q.id] as string) || ""}
                onChange={(e) => setValue(`answers.${q.id}`, e.target.value)}
              />
            )}
            
            {q.type === "multiple" && (
              <RadioGroup
                onValueChange={(val) => setValue(`answers.${q.id}`, val)}
                value={(answers[q.id] as string) || ""}
              >
                {q.options?.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`${q.id}-radio-${i}`} />
                    <Label htmlFor={`${q.id}-radio-${i}`}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {q.type === "checkbox" &&
              q.options?.map((opt, i) => {
                const current = (answers[q.id] as string[]) || [];
                const checked = current.includes(opt);
                return (
                  <div key={i} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`${q.id}-checkbox-${i}`}
                      checked={checked}
                      onCheckedChange={(val) => {
                        if (val) {
                          setValue(`answers.${q.id}`, [...current, opt]);
                        } else {
                          setValue(`answers.${q.id}`, current.filter((o) => o !== opt));
                        }
                      }}
                    />
                    <Label htmlFor={`${q.id}-checkbox-${i}`}>{opt}</Label>
                  </div>
                );
              })}
            
            {errors.answers?.[q.id] && <p className="mt-1 text-red-500 text-sm">{errors.answers[q.id]?.toString()}</p>}
          </CardContent>
        </Card>
      ))}
      
      {/* Horarios */}
      {(schedules?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Elige tus horarios disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.map((s) => {
              const checked = (selectedSchedules || []).includes(s.id);
              return (
                <div key={s.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`schedule-${s.id}`}
                    checked={checked}
                    onCheckedChange={(val) => {
                      if (val) {
                        setValue("schedules", [...selectedSchedules, s.id]);
                      } else {
                        setValue("schedules", selectedSchedules.filter((id) => id !== s.id));
                      }
                    }}
                  />
                  <Label htmlFor={`schedule-${s.id}`}>{formatSchedule(s)}</Label>
                </div>
              );
            })}
            {errors.schedules && <p className="mt-1 text-red-500 text-sm">{errors.schedules.message}</p>}
          </CardContent>
        </Card>
      )}
      
      <Button type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
              size="lg">
        Guardar respuestas
      </Button>
    </form>
  );
}
