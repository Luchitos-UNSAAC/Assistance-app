"use client";

import { useEffect, useState } from "react";
import {Card, CardContent} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {CallForVolunteers, CallQuestion} from "@prisma/client";
import {commonQuestionsList} from "@/features/calls/data/common-questions";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

type QuestionType = "short" | "paragraph" | "multiple" | "checkbox";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

interface QuestionsPreviewProps {
  questions: CallQuestion[];
  call: CallForVolunteers
}

export default function PreviewQuestions({ questions: serverQuestions, call }: QuestionsPreviewProps) {
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);
  const router = useRouter()
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
    setLocalQuestions(serverQuestions.map(mapFromPrisma));
  }, [serverQuestions]);
  
  
  return (
    <div className="max-w-3xl mx-auto space-y-4 p-6">
     <div className="flex flex-col   md:flex-row gap-2 justify-between">
       <h1 className="text-2xl font-bold mb-4">Vista previa</h1>
       <Button onClick={() => router.push("/calls")}
               variant='outline'
       >
         <ArrowLeft className="w-4 h-4"/>
         Volver a Convocatorias
       </Button>
     </div>
      
      {commonQuestionsList.map((item, index) => (
        <Card className="p-4">
          <CardContent>
            <p className="font-medium mb-2">{index + 1 }. {item.text}</p>
            {item.type === "short" && (
              <Input placeholder="Respuesta corta" disabled />
            )}
            
            {item.type === "paragraph" && (
              <textarea
                className="w-full border rounded-md p-2"
                placeholder="Párrafo"
                disabled
              />
            )}
          </CardContent>
        </Card>
      ))}
      
      
      {localQuestions.map((q,index2) => (
        <Card key={q.id} className="p-4">
          <CardContent>
            <p className="font-medium mb-2">
              {commonQuestionsList.length + index2 + 1 }. {q.text}
            </p>
            
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
