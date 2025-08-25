"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type QuestionType = "short" | "paragraph" | "multiple" | "checkbox";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  isEditing: boolean;
}

export default function QuestionsForm() {
  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), text: "", type: "short", options: [], isEditing: true },
  ]);
  
  const handleSave = (id: string, updated: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updated, isEditing: false } : q))
    );
    // Agregar una nueva pregunta editable
    setQuestions(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: "", type: "short", options: [], isEditing: true },
    ]);
  };
  
  const handleEdit = (id: string) => {
    setQuestions(prev =>
      prev.map(q => ({ ...q, isEditing: q.id === id }))
    );
  };
  
  const handleAddOption = (id: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === id
          ? { ...q, options: [...(q.options || []), ""] }
          : q
      )
    );
  };
  
  const handleUpdateOption = (id: string, index: number, value: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === id
          ? {
            ...q,
            options: q.options?.map((opt, i) => (i === index ? value : opt)),
          }
          : q
      )
    );
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {questions.map((q, index) => (
        <Card key={q.id} className="p-4">
          <CardContent>
            {q.isEditing ? (
              <div className="space-y-3">
                {/* Input de la pregunta */}
                <Input
                  placeholder={`Pregunta ${index + 1}`}
                  value={q.text}
                  onChange={e =>
                    setQuestions(prev =>
                      prev.map(item =>
                        item.id === q.id ? { ...item, text: e.target.value } : item
                      )
                    )
                  }
                />
                
                {/* Selección del tipo de pregunta */}
                <Select
                  value={q.type}
                  onValueChange={(val: QuestionType) =>
                    setQuestions(prev =>
                      prev.map(item =>
                        item.id === q.id ? { ...item, type: val } : item
                      )
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de respuesta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Respuesta corta</SelectItem>
                    <SelectItem value="paragraph">Párrafo</SelectItem>
                    <SelectItem value="multiple">Opción múltiple</SelectItem>
                    <SelectItem value="checkbox">Casillas de verificación</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Opciones dinámicas para múltiple/checkbox */}
                {(q.type === "multiple" || q.type === "checkbox") && (
                  <div className="space-y-2">
                    {q.options?.map((opt, i) => (
                      <Input
                        key={i}
                        placeholder={`Opción ${i + 1}`}
                        value={opt}
                        onChange={e => handleUpdateOption(q.id, i, e.target.value)}
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
                
                {/* Guardar */}
                <Button onClick={() => handleSave(q.id, { text: q.text })}>
                  Guardar
                </Button>
              </div>
            ) : (
              <div>
                {/* Vista previa estilo Google Forms */}
                <p className="font-medium">{q.text}</p>
                {q.type === "short" && <Input placeholder="Respuesta corta" disabled />}
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
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleEdit(q.id)}
                >
                  Editar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
