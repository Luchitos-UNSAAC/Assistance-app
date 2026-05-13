import Link from "next/link"

export default function PublicFooter() {
  return (
    <footer className="bg-white border-t-2 border-gray-100 mt-12 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-purple-700 mb-3">Sobre LUCHOS UNSAAC</h3>
            <p className="text-sm text-gray-600">
              Plataforma de gestión de voluntarios para el cuidado canino en la Universidad Nacional de San Antonio Abad del Cusco.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-purple-700 mb-3">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/politica-privacidad" className="text-gray-600 hover:text-purple-600 transition">
                  → Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos-servicio" className="text-gray-600 hover:text-purple-600 transition">
                  → Términos de Servicio
                </Link>
              </li>
              <li>
                <a href="mailto:support@luchos-unsaac.edu.pe" className="text-gray-600 hover:text-purple-600 transition">
                  → Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-purple-700 mb-3">Información de Contacto</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📧 <a href="mailto:support@luchos-unsaac.edu.pe" className="hover:text-purple-600">support@luchos-unsaac.edu.pe</a></p>
              <p>📞 <a href="tel:+51" className="hover:text-purple-600">UNSAAC - Cusco</a></p>
              <p>📍 Cusco, Perú</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-1 mb-3 sm:mb-0">
            <span>❤️ Hecho con amor para los voluntarios</span>
          </div>
          <div>
            <p>© {new Date().getFullYear()} LUCHOS UNSAAC. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

