"use client";

import {useState, useEffect} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {CallForVolunteers, CallQuestion} from "@prisma/client";
import {useRouter} from "next/navigation";
import {ArrowLeft, Trash} from "lucide-react";
import {commonQuestionsList} from "@/features/calls/data/common-questions";
import {useDeleteModalStore} from "@/lib/delete-modal-store";

type QuestionTypeForm = "short" | "paragraph" | "multiple" | "checkbox";

interface Question {
  id?: string;
  text: string;
  type: QuestionTypeForm;
  options?: string[];
  isEditing: boolean;
  isNew: boolean;
}

interface QuestionsFormProps {
  questions: CallQuestion[];
  call: CallForVolunteers;
}

export default function QuestionsForm({questions, call}: QuestionsFormProps) {
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);
  const router = useRouter();
  const { openModal: openModalToDelete } = useDeleteModalStore()
  
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
    isEditing: false,
    isNew: false,
  });
  
  const mapToPrisma = (q: Question) => ({
    id: q.id || undefined,
    question: q.text,
    type:
      q.type === "short"
        ? "TEXT"
        : q.type === "paragraph"
          ? "NUMBER"
          : q.type === "multiple"
            ? "MULTIPLE"
            : "BOOLEAN",
    options: q.options || [],
  });
  
  useEffect(() => {
    if (questions?.length) {
      setLocalQuestions(questions.map(mapFromPrisma));
    }
  }, [questions]);
  
  const handleSave = async (id?: string, updated?: Partial<Question>) => {
    try {
      const questionToSave = localQuestions.find((q) => q.id === id || q.isNew);
      if (!questionToSave) return;
      
      const payload = mapToPrisma({
        ...questionToSave,
        ...updated,
      });
      
      const res = await fetch(`/api/calls/${call.id}/questions`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        console.error("Error guardando la pregunta");
        return;
      }
      
      router.refresh();
    } catch (error) {
      console.error("Error en handleSave:", error);
    }
  };
  
  const handleDelete = async (id?: string) => {
    openModalToDelete(
      "Eliminar pregunta",
      "¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.",
      async () => {
        await fetch(`/api/calls/${call.id}/questions?questionId=${id}`, {
          method: "DELETE",
        });
        setLocalQuestions((prev) => prev.filter((q) => q.id !== id));
        // router.refresh();
      })
  }
  
  const handleEdit = (id?: string) => {
    setLocalQuestions((prev) =>
      prev.map((q) => ({...q, isEditing: q.id === id}))
    );
  };
  
  const handleAddOption = (id?: string) => {
    setLocalQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? {...q, options: [...(q.options || []), ""]} : q
      )
    );
  };
  
  const handleUpdateOption = (id: string | undefined, index: number, value: string) => {
    setLocalQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
            ...q,
            options: q.options?.map((opt, i) => (i === index ? value : opt)),
          }
          : q
      )
    );
  };
  
  const handleAddQuestion = () => {
    setLocalQuestions((prev) => [
      ...prev,
      {text: "", type: "short", options: [], isEditing: true, isNew: true},
    ]);
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-4 px-3 md:px-1">
      <div className="flex flex-col md:flex-row justify-end gap-2">
        <Button onClick={() => router.push("/calls")}
                variant='outline'
        >
          <ArrowLeft className="w-4 h-4"/>
          Volver a Convocatorias
        </Button>
        <Link href={`/calls/${call.id}/questions/preview`} target="_blank" className="w-full md:w-auto">
          <Button variant="outline">Ver previsualización</Button>
        </Link>
        <Button variant="outline" onClick={handleAddQuestion}>
          Agregar
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold">
        Preguntas Comunes ( {commonQuestionsList.length} )
      </h1>
      
      <div className="flex flex-col gap-2 w-full overflow-x-auto pb-2">
        {commonQuestionsList.map((q, index) => (
          <Card key={q.id ?? index} className="pt-1">
            <CardContent>
              <div key={index} className="flex items-center space-x-2">
                {/*<input type="checkbox" id={"checkbox-common"+index}/>*/}
                
                <label htmlFor={"checkbox-common"+index}>{index + 1}. {q.text}</label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <h1 className="text-2xl font-bold">
        Preguntas Personalizadas ( {localQuestions.length} )
      </h1>
      {localQuestions.map((q, index) => (
        <Card key={q.id ?? index} className="p-4">
          <CardContent>
            {q.isEditing ? (
              <div className="space-y-3">
                <Input
                  placeholder={`Pregunta ${index + 1}`}
                  value={q.text}
                  onChange={(e) =>
                    setLocalQuestions((prev) =>
                      prev.map((item) =>
                        item.id === q.id ? {...item, text: e.target.value} : item
                      )
                    )
                  }
                />
                
                <Select
                  value={q.type}
                  onValueChange={(val: QuestionTypeForm) =>
                    setLocalQuestions((prev) =>
                      prev.map((item) =>
                        item.id === q.id ? {...item, type: val} : item
                      )
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de respuesta"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Texto</SelectItem>
                    <SelectItem value="multiple">
                      Opción múltiple
                    </SelectItem>
                    <SelectItem value="checkbox">
                      Casillas
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {(q.type === "multiple" || q.type === "checkbox") && (
                  <div className="space-y-2">
                    {q.options?.map((opt, i) => (
                      <Input
                        key={i}
                        placeholder={`Opción ${i + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleUpdateOption(q.id, i, e.target.value)
                        }
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddOption(q.id)}
                    >
                      + Agregar opción
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => handleSave(q.id, {text: q.text})}
                >
                  Guardar
                </Button>
              </div>
            ) : (
              <div>
                <p className="font-medium">{q.text}</p>
                {q.type === "short" && (
                  <Input placeholder="Texto" disabled/>
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
                      <input type="radio" disabled/>
                      <span>{opt}</span>
                    </div>
                  ))}
                {q.type === "checkbox" &&
                  q.options?.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input type="checkbox" disabled/>
                      <span>{opt}</span>
                    </div>
                  ))}
                
                <div className="flex space-x-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleEdit(q.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 ml-2 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash className="w-3 h-3"/>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
