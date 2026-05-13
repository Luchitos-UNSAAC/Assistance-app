import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos de Servicio - LUCHOS UNSAAC",
  description:
    "Términos de servicio de LUCHOS UNSAAC - Gestión de voluntarios para cuidado canino en UNSAAC",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 text-center border-b-2 border-purple-200 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-2">
            Términos de Servicio
          </h1>
          <p className="text-gray-600">LUCHOS UNSAAC - Gestión de Voluntarios</p>
          <p className="text-sm text-gray-500 mt-2">
            Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-700">
          {/* Acceptance */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">1. Aceptación de Términos</h2>
            <p>
              Al acceder y utilizar LUCHOS UNSAAC (la "Plataforma"), aceptas estar vinculado por estos Términos de Servicio.
              Si no estás de acuerdo con algún parte de estos términos, no debes utilizar la Plataforma.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">2. Elegibilidad</h2>
            <p>
              Para utilizar LUCHOS UNSAAC, debes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
              <li>Tener al menos 18 años de edad</li>
              <li>Ser un voluntario activo o potencial de UNSAAC</li>
              <li>Proporcionar información precisa, actual y completa</li>
              <li>Mantener la confidencialidad de tu contraseña</li>
              <li>Ser responsable de todas las actividades bajo tu cuenta</li>
            </ul>
          </section>

          {/* Account Responsibility */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">3. Responsabilidad de la Cuenta</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="mb-2">Eres totalmente responsable de:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Mantener la confidencialidad de tu contraseña y cuenta.</li>
                <li>Autorizar todos los accesos a tu cuenta.</li>
                <li>Notificar a LUCHOS UNSAAC de cualquier uso no autorizado.</li>
                <li>Mantener toda la información de tu perfil actualizada y precisa.</li>
                <li>No intentar acceder a cuentas de otros usuarios.</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Usage */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">4. Uso Aceptable</h2>
            <p className="mb-3">Al usar LUCHOS UNSAAC, te comprometes a NO:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="text-red-500 mr-3 font-bold">✗</span>
                <span>Usar la Plataforma para cualquier propósito ilegal o no autorizado.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-3 font-bold">✗</span>
                <span>Violar leyes, regulaciones o derechos de terceros.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-3 font-bold">✗</span>
                <span>Transmitir contenido ofensivo, amenazante, abusivo, difamatorio, obsceno o ilegal.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-3 font-bold">✗</span>
                <span>Intentar acceder a datos de otros usuarios sin autorización.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-3 font-bold">✗</span>
                <span>Usar la Plataforma para phishing, spam o cualquier forma de estafa.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-3 font-bold">✗</span>
                <span>Intentar dañar, deshabilitar o interferir con la Plataforma.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-3 font-bold">✗</span>
                <span>Usar bots, scrapers o herramientas no autorizadas para acceder a la Plataforma.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-3 font-bold">✗</span>
                <span>Engañar a otros sobre tu identidad o información.</span>
              </li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">5. Propiedad Intelectual</h2>
            <p className="mb-3">
              Todo contenido, diseño, funcionalidad y código en LUCHOS UNSAAC (incluyendo pero no limitado a texto, gráficos,
              logos, iconos, código) son propiedad de UNSAAC o sus proveedores de contenido y están protegidos por
              derechos de autor internacionales.
            </p>
            <p>
              Se te otorga una licencia limitada, no exclusiva y no transferible para acceder y usar la Plataforma.
              No puedes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Reproducir, distribuir o transmitir el contenido.</li>
              <li>Modificar, alterar o crear trabajos derivados.</li>
              <li>Usar el contenido para fines comerciales sin permiso.</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">6. Limitación de Responsabilidad</h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="mb-3">
                <strong>LUCHOS UNSAAC SE PROPORCIONA "TAL CUAL" SIN GARANTÍAS DE NINGÚN TIPO.</strong>
              </p>
              <p className="text-sm mb-2">
                En la máxima medida permitida por la ley:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>No garantizamos que la Plataforma sea ininterrumpida o libre de errores.</li>
                <li>No somos responsables de ninguna pérdida de datos, acceso no autorizado u otros daños.</li>
                <li>Nuestra responsabilidad total no excederá la cantidad que pagaste (si corresponde) en los últimos 12 meses.</li>
                <li>No seremos responsables por daños indirectos, especiales o consecuentes.</li>
              </ul>
            </div>
          </section>

          {/* Attendance and Participation */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">7. Asistencia y Participación</h2>
            <p>
              Al registrarte para eventos de voluntariado a través de LUCHOS UNSAAC:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Te comprometes a asistir en la fecha y hora indicadas.</li>
              <li>Debes notificar con anticipación si no puedes asistir.</li>
              <li>Tu asistencia será registrada y utilizada para seguimiento y reconocimiento.</li>
              <li>UNSAAC se reserva el derecho de remover a voluntarios por ausencias reiteradas.</li>
            </ul>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">8. Contenido del Usuario</h2>
            <p className="mb-2">
              Cualquier información, respuesta o contenido que proporciones ("Contenido del Usuario"):
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 font-bold">•</span>
                <span>Es completamente tu responsabilidad.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 font-bold">•</span>
                <span>No debe violar derechos de terceros.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 font-bold">•</span>
                <span>Nos otorgas permiso para usar tu Contenido del Usuario en operaciones de la Plataforma.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 font-bold">•</span>
                <span>Podemos eliminar contenido que viole estos términos.</span>
              </li>
            </ul>
          </section>

          {/* Suspension and Termination */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">9. Suspensión y Terminación</h2>
            <p className="mb-2">
              LUCHOS UNSAAC puede suspender o terminar tu acceso a la Plataforma si:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Violas estos Términos de Servicio.</li>
              <li>Realizas actividades fraudulentas o ilegales.</li>
              <li>Cesa tu afiliación con UNSAAC.</li>
              <li>Es necesario por razones de seguridad o legales.</li>
            </ul>
            <p className="mt-3">
              En caso de suspensión, se te notificará por correo electrónico con una explicación.
            </p>
          </section>

          {/* Links and Third Parties */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">10. Enlaces y Servicios de Terceros</h2>
            <p>
              LUCHOS UNSAAC puede contener enlaces a sitios web o servicios de terceros. No somos responsables
              del contenido, políticas de privacidad o prácticas de estos sitios. Tu uso de servicios de terceros
              está sujeto a sus propios términos y condiciones.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">11. Cambios en los Términos</h2>
            <p>
              Podemos modificar estos Términos en cualquier momento. Te notificaremos de cambios significativos
              mediante un aviso en la Plataforma. Tu uso continuado constituye aceptación de los términos modificados.
            </p>
          </section>

          {/* Governed Law */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">12. Ley Aplicable y Jurisdicción</h2>
            <p>
              Estos Términos de Servicio se rigen por las leyes de la República del Perú, específicamente
              las regulaciones de Cusco. Cualquier disputa se resolverá en los juzgados competentes de Cusco.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">13. Resolución de Disputas</h2>
            <p className="mb-2">
              Antes de iniciar procedimientos legales, ambas partes se comprometen a:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Comunicar por escrito el problema específico.</li>
              <li>Intentar resolver mediante negociación de buena fe dentro de 30 días.</li>
              <li>Si no se resuelve, pueden recurrir a mediación no vinculante.</li>
            </ul>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold text-purple-700 mb-3">14. Divisibilidad</h2>
            <p>
              Si alguna disposición de estos Términos se considera inválida o inaplicable, dicha disposición
              será eliminada, pero el resto de los Términos permanecerá en pleno efecto.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">15. Preguntas o Inquietudes</h2>
            <p className="mb-3">
              Si tienes preguntas sobre estos Términos de Servicio, contáctanos:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>📧 Email:</strong> support@luchos-unsaac.edu.pe
              </p>
              <p>
                <strong>🏢 Institución:</strong> LUCHOS UNSAAC - Universidad Nacional de San Antonio Abad del Cusco
              </p>
              <p className="text-xs text-gray-700 mt-3">
                Nos esforzamos por responder dentro de 7 días hábiles.
              </p>
            </div>
          </section>

          {/* Related Policies */}
          <section className="mt-8 pt-6 border-t-2 border-gray-200">
            <h3 className="font-bold text-purple-700 mb-3">Políticas Relacionadas</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/politica-privacidad"
                className="flex-1 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-center font-medium"
              >
                📋 Política de Privacidad
              </Link>
            </div>
          </section>

          {/* Footer */}
          <section className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Al usar LUCHOS UNSAAC, aceptas estos Términos de Servicio.
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

