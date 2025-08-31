"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CallQuestion } from "@prisma/client";

type QuestionType = "short" | "paragraph" | "multiple" | "checkbox";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

interface QuestionsPreviewProps {
  questions: CallQuestion[];
}

export default function QuestionsToFill({ questions: serverQuestions }: QuestionsPreviewProps) {
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  
  // Prisma -> Form mapping
  const mapFromPrisma = (q: CallQuestion): Question => ({
    id: q.id,
    text: q.question,
    type:
      q.type === "TEXT"
        ? "short"
        : q.type === "NUMBER"
          ? "paragraph"
          : q.type === "MULTIPLE"
            ? "multiple"
            : "checkbox",
    // @ts-ignore
    options: Array.isArray(q.options)
      ? (q.options.filter((opt): opt is string => typeof opt === "string") as string[])
      : [],
  });
  
  useEffect(() => {
    setLocalQuestions(serverQuestions.map(mapFromPrisma));
  }, [serverQuestions]);
  
  // Manejo de respuestas
  const handleChange = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Respuestas enviadas:", answers);
    // Aquí puedes hacer fetch() o axios.post() para guardar en la API
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Formulario</h1>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-start space-x-2 text-lg">
            <span className="font-bold text-primary">1.</span>
            <span>Correo institucional</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="010101@unsaac.edu.pe"
            value={""}
            onChange={()=>{}}
          />
        </CardContent>
      </Card>
      
      {localQuestions.map((q, index) => (
        <Card key={q.id} className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-start space-x-2 text-lg">
              <span className="font-bold text-primary">{index + 1}.</span>
              <span>{q.text}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {q.type === "short" && (
              <Input
                placeholder="Escribe tu respuesta..."
                value={(answers[q.id] as string) || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            )}
            
            {q.type === "paragraph" && (
              <Textarea
                placeholder="Escribe un párrafo..."
                value={(answers[q.id] as string) || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            )}
            
            {q.type === "multiple" && (
              <RadioGroup
                onValueChange={(val) => handleChange(q.id, val)}
                value={(answers[q.id] as string) || ""}
              >
                {q.options?.length ? (
                  q.options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`${q.id}-radio-${i}`} />
                      <Label htmlFor={`${q.id}-radio-${i}`}>{opt}</Label>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No hay opciones disponibles</p>
                )}
              </RadioGroup>
            )}
            
            {q.type === "checkbox" && (
              <>
                {q.options?.length ? (
                  q.options.map((opt, i) => {
                    const current = (answers[q.id] as string[]) || [];
                    const checked = current.includes(opt);
                    return (
                      <div key={i} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${q.id}-checkbox-${i}`}
                          checked={checked}
                          onCheckedChange={(val) => {
                            if (val) {
                              handleChange(q.id, [...current, opt]);
                            } else {
                              handleChange(
                                q.id,
                                current.filter((o) => o !== opt)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`${q.id}-checkbox-${i}`}>{opt}</Label>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm">No hay opciones disponibles</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ))}
      
      <Button type="submit" className="w-full" size="lg">
        Guardar respuestas
      </Button>
    </form>
  );
}
