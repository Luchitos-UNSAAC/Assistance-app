# Instrucciones para Code Review con GitHub Copilot

Al revisar código en este repositorio, sigue estrictamente estas reglas:

1. **Seguridad primero**: Detecta y señala cualquier vulnerabilidad potencial, incluyendo inyección SQL, XSS, CSRF o manejo inseguro de datos sensibles.
2. **Legibilidad**: El código debe ser claro, con nombres de variables y funciones descriptivos. Evita abreviaturas confusas.
3. **Eficiencia**: Sugiere optimizaciones si encuentras código redundante, bucles innecesarios o consultas a base de datos ineficientes.
4. **Estilo consistente**: Cumple con el estándar de formato del repositorio (indentación, comillas, espaciado, uso de llaves).
5. **Control de errores**: Todas las funciones que puedan fallar deben manejar errores de forma segura y consistente.
6. **Comentarios útiles**: El código complejo debe estar documentado con comentarios claros que expliquen el “por qué” más que el “qué”.
7. **Evitar código muerto**: Identifica y recomienda la eliminación de código no utilizado o duplicado.
8. **Buenas prácticas de seguridad en contraseñas y claves**: Nunca exponer secretos en el código. Usar variables de entorno.
9. **Validaciones y sanitización de datos**: Todas las entradas deben validarse y limpiarse antes de ser procesadas o guardadas.
10. **Pruebas y cobertura**: Si el cambio afecta la lógica, sugerir o verificar que existan pruebas unitarias o de integración correspondientes.
