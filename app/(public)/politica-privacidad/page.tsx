import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad - LUCHOS UNSAAC",
  description:
    "Política de privacidad de LUCHOS UNSAAC - Gestión de voluntarios para cuidado canino en UNSAAC",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 text-center border-b-2 border-purple-200 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-2">
            Política de Privacidad
          </h1>
          <p className="text-gray-600">LUCHOS UNSAAC - Gestión de Voluntarios</p>
          <p className="text-sm text-gray-500 mt-2">
            Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-700">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">1. Introducción</h2>
            <p>
              En <strong>LUCHOS UNSAAC</strong>, nos comprometemos a proteger tu privacidad y garantizar
              que comprendas cómo recopilamos, utilizamos y protegemos tus datos personales. Esta Política
              de Privacidad explica nuestras prácticas de privacidad para la plataforma web y aplicación móvil
              de gestión de voluntarios.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              2. Información que Recopilamos
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <h3 className="font-bold text-blue-900 mb-2">Datos Personales Directos</h3>
              <p className="text-sm">
                Cuando te registras o actualizas tu perfil, recopilamos:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Nombre completo</li>
                <li>Correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Dirección domiciliaria</li>
                <li>Fecha de nacimiento</li>
                <li>Número de DNI (Documento Nacional de Identidad)</li>
                <li>Contraseña (encriptada de forma segura)</li>
                <li>Foto de perfil (opcional)</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
              <h3 className="font-bold text-green-900 mb-2">Datos de Dispositivo</h3>
              <p className="text-sm">
                Para brindar una mejor experiencia y funcionamiento de la aplicación, recopilamos:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Identificador único del dispositivo (Device ID)</li>
                <li>Sistema operativo (Android/iOS) y versión</li>
                <li>Modelo y marca del dispositivo</li>
                <li>Versión de la aplicación</li>
                <li>Token de notificación push (para enviar recordatorios y notificaciones)</li>
                <li>Dirección IP (únicamente para fines de seguridad)</li>
                <li>Hora de última actividad</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <h3 className="font-bold text-yellow-900 mb-2">Datos de Actividad</h3>
              <p className="text-sm">
                Registramos automáticamente información sobre tu interacción con la plataforma:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Asistencia a eventos de voluntariado (fecha, hora, estado)</li>
                <li>Participación en convocatorias de voluntarios</li>
                <li>Respuestas a formularios y encuestas</li>
                <li>Notificaciones recibidas y confirmación de lectura</li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              3. Cómo Utilizamos Tu Información
            </h2>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="text-purple-500 mr-3 font-bold">✓</span>
                <span><strong>Gestión de tu cuenta:</strong> Crear perfil, autenticación segura y gestionar tu información.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-3 font-bold">✓</span>
                <span><strong>Registro de asistencia:</strong> Registrar tu participación en actividades de voluntariado.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-3 font-bold">✓</span>
                <span><strong>Notificaciones:</strong> Enviarte recordatorios sobre eventos, convocatorias y actualizaciones importantes.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-3 font-bold">✓</span>
                <span><strong>Mejora del servicio:</strong> Analizar uso de la plataforma para optimizar funcionalidades.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-3 font-bold">✓</span>
                <span><strong>Seguridad:</strong> Prevenir fraude, acceso no autorizado y otros riesgos de seguridad.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-3 font-bold">✓</span>
                <span><strong>Cumplimiento legal:</strong> Cumplir con leyes, regulaciones y solicitudes de autoridades.</span>
              </li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              4. Protección de Datos Sensibles
            </h2>

            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <h3 className="font-bold text-red-900 mb-3">🔒 Medidas de Seguridad</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>Encriptación en tránsito:</strong> Todos los datos se transmiten mediante HTTPS/TLS.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>Encriptación de contraseñas:</strong> Las contraseñas se almacenan usando algoritmos de hash seguros (nunca en texto plano).</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>Control de acceso:</strong> Acceso restringido a datos personales por roles (Voluntario, Gestor, Admin).</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>Auditoría:</strong> Registramos todos los cambios en datos sensibles para detectar accesos no autorizados.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>Base de datos segura:</strong> PostgreSQL con restricciones de acceso y backups periódicos.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>Autenticación JWT:</strong> Tokens seguros con expiración automática (7 días).</span>
                </li>
              </ul>
            </div>

            <h3 className="font-bold text-purple-900 mb-2">Datos Nunca Compartidos Públicamente</h3>
            <p className="text-sm bg-purple-100 p-3 rounded">
              Tu DNI, contraseña, número de teléfono y datos de dispositivo <strong>NUNCA se comparten</strong> con terceros.
              Solo los administradores autorizados del sistema pueden acceder a esta información con propósitos de gestión.
            </p>
          </section>

          {/* Device Information Handling */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              5. Manejo de Información del Dispositivo
            </h2>
            <p className="mb-3">
              Recopilamos información del dispositivo para mejorar tu experiencia y brindarte un servicio más seguro:
            </p>
            <ul className="space-y-3">
              <li>
                <strong className="text-blue-700">Identificador del Dispositivo:</strong> Se utiliza para asegurar que solo tus dispositivos autorizados accedan a tu cuenta.
              </li>
              <li>
                <strong className="text-blue-700">Información de SO y Hardware:</strong> Nos ayuda a optimizar la aplicación para diferentes dispositivos y versiones de Android/iOS.
              </li>
              <li>
                <strong className="text-blue-700">Token Push:</strong> Enviamos notificaciones personalizadas sobre eventos de voluntariado, asistencia y recordatorios.
              </li>
              <li>
                <strong className="text-blue-700">Dirección IP (último acceso):</strong> Registrada por seguridad para detectar accesos sospechosos. Se elimina automáticamente después de 90 días.
              </li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              6. Retención de Datos
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
              <div>
                <strong className="text-gray-900">Datos de Perfil:</strong>
                <p className="text-sm text-gray-700">Se mantienen mientras tu cuenta esté activa. Puedes solicitar eliminar tu cuenta en cualquier momento.</p>
              </div>
              <div>
                <strong className="text-gray-900">Registros de Asistencia:</strong>
                <p className="text-sm text-gray-700">Se conservan indefinidamente para fines de auditoría y años de servicio. Estos datos no incluyen información personal sensible adicional.</p>
              </div>
              <div>
                <strong className="text-gray-900">Información de Dispositivo:</strong>
                <p className="text-sm text-gray-700">Se actualiza con cada acceso. Los últimos 6 meses de registros de IP se mantienen por seguridad; después se eliminan automáticamente.</p>
              </div>
              <div>
                <strong className="text-gray-900">Logs de Auditoría:</strong>
                <p className="text-sm text-gray-700">Se conservan durante 1 año para investigar incidentes de seguridad.</p>
              </div>
              <div>
                <strong className="text-gray-900">DNI y Datos Sensibles:</strong>
                <p className="text-sm text-gray-700">Se conservan según los requisitos de la institución. Utilizamos encriptación adicional para cumplir con regulaciones de protección de datos.</p>
              </div>
            </div>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              7. Tus Derechos
            </h2>
            <p className="mb-3">Tienes derecho a:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 font-bold">→</span>
                <span><strong>Acceso:</strong> Solicitar una copia de tus datos personales.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 font-bold">→</span>
                <span><strong>Rectificación:</strong> Corregir información incorrecta o incompleta.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 font-bold">→</span>
                <span><strong>Eliminación:</strong> Solicitar la eliminación de tus datos bajo ciertas circunstancias.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 font-bold">→</span>
                <span><strong>Portabilidad:</strong> Recibir tus datos en formato legible.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 font-bold">→</span>
                <span><strong>Oposición:</strong> Oponerte a ciertos tipos de procesamiento de datos.</span>
              </li>
            </ul>
          </section>

          {/* Third Parties */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              8. Compartir Información con Terceros
            </h2>
            <p className="mb-3">
              LUCHOS UNSAAC no vende ni alquila tus datos personales. Solo compartimos información en estos casos:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 font-bold">•</span>
                <span><strong>Personal autorizado:</strong> Con gerentes y administradores para gestión de voluntarios.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 font-bold">•</span>
                <span><strong>Obligación legal:</strong> Cuando lo requiere la ley o una orden judicial.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 font-bold">•</span>
                <span><strong>Proveedores de servicio:</strong> Únicamente con socios que ayudan a mantener la plataforma (hosting, base de datos) bajo estrictos acuerdos de confidencialidad.</span>
              </li>
            </ul>
          </section>

          {/* Security Incidents */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              9. Incidentes de Seguridad
            </h2>
            <p className="mb-3">
              En caso de una violación de seguridad que comprometa tus datos personales:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Notificaremos a los usuarios afectados sin demora injustificada.</li>
              <li>Proporcionaremos detalles sobre el tipo de datos comprometidos.</li>
              <li>Ofreceremos medidas para proteger tu información (cambio de contraseña, monitoreo, etc.).</li>
              <li>
                Investigaremos la causa raíz y implementaremos medidas correctivas para prevenir futuros incidentes.
              </li>
            </ul>
          </section>

          {/* Children Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              10. Privacidad de Menores
            </h2>
            <p>
              LUCHOS UNSAAC está diseñado para usuarios mayores de 18 años. No recopilamos deliberadamente información
              de menores. Si descubrimos que hemos recopilado datos de un menor sin consentimiento parental, eliminaremos
              la información inmediatamente. Si crees que esto sucedió, por favor contáctanos.
            </p>
          </section>

          {/* Policy Changes */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">
              11. Cambios en Política de Privacidad
            </h2>
            <p>
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cambios significativos
              mediante un aviso en la aplicación. Tu continuación usando la plataforma después del cambio implica aceptación.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">
              12. Contáctanos
            </h2>
            <p className="mb-4">
              Si tienes preguntas, inquietudes o deseas ejercer tus derechos de privacidad, contáctanos:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>📧 Email:</strong> privacy@luchos-unsaac.edu.pe
              </p>
              <p>
                <strong>🏢 Institución:</strong> LUCHOS UNSAAC - Universidad Nacional de San Antonio Abad del Cusco
              </p>
              <p>
                <strong>📍 Ubicación:</strong> Cusco, Perú
              </p>
              <p className="text-xs text-gray-600 mt-3">
                Responderemos a todas las solicitudes dentro de 30 días hábiles.
              </p>
            </div>
          </section>

          {/* Related Policies */}
          <section className="mt-8 pt-6 border-t-2 border-gray-200">
            <h3 className="font-bold text-purple-700 mb-3">Documentos Relacionados</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/terminos-servicio"
                className="flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-center font-medium"
              >
                📜 Términos de Servicio
              </Link>
            </div>
          </section>

          {/* Footer */}
          <section className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Al usar LUCHOS UNSAAC, aceptas esta Política de Privacidad.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
            >
              ← Volver al inicio
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}

