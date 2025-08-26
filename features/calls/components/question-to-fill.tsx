"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    options: Array.isArray(q.options) ? (q.options.filter((opt): opt is string => typeof opt === "string") as string[]) : [],
  });
  
  useEffect(() => {
    serverQuestions.map(mapFromPrisma);
  }, [serverQuestions]);
  
  return (
    <div className="max-w-3xl mx-auto space-y-4 p-6">
      <h1 className="text-2xl font-bold mb-4">Vista previa</h1>
      
      {localQuestions.map((q) => (
        <Card key={q.id} className="p-4">
          <CardContent>
            <p className="font-medium mb-2">{q.text}</p>
            
            {q.type === "short" && (
              <Input placeholder="Respuesta corta" disabled />
            )}
            
            {q.type === "paragraph" && (
              <textarea
                className="w-full border rounded-md p-2"
                placeholder="Párrafo"
                disabled
              />
            )}
            
            {q.type === "multiple" &&
              q.options?.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input type="radio" disabled />
                  <span>{opt}</span>
                </div>
              ))}
            
            {q.type === "checkbox" &&
              q.options?.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input type="checkbox" disabled />
                  <span>{opt}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
