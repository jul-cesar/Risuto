import Link from "next/link";

 export default function Footer() {
  return (
    <footer className="bg-background py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Risuto</h3>
              <p className="text-muted-foreground mb-4">
                Tu plataforma definitiva para descubrir, organizar y disfrutar
                del mundo de la literatura.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/jul-cesar/Risuto"
                  className="text-muted-foreground hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 0C5.372 0 0 5.372 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577 
                    0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.729.082-.729 
                    1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.107-.775.418-1.305.76-1.605-2.665-.305-5.467-1.332-5.467-5.932 
                    0-1.31.469-2.382 1.235-3.222-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.51 11.51 0 0 1 3-.404c1.02.005 2.047.137 3 
                    .404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.912 1.233 3.222 
                    0 4.61-2.807 5.624-5.48 5.922.43.372.823 1.102.823 2.222 
                    0 1.606-.015 2.898-.015 3.293 0 .319.192.694.801.576C20.565 21.796 24 17.3 24 12c0-6.628-5.373-12-12-12Z"
                  />
                  </svg>
                </a>
                
                
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Explorar</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Catálogo
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Géneros
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Novedades
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Populares
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Autores
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Ayuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Términos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Risuto. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
  );
 }