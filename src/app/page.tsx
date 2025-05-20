import {
  ArrowRight,
  BookOpen,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getTrendingBooks } from "@/actions/book-actions";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import createList from "../../public/images/create-list.jpg";
import membersList from "../../public/images/members-private.jpg";
import { TrendingBooks } from "./dashboard/components/books/trending-books";

export default async function LandingPage() {
  const trendings = (await getTrendingBooks()).data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-0"></div>

        {/* Hero content */}
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col gap-10 lg:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Descubre y organiza tu mundo literario
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Risuto te ayuda a descubrir nuevos libros, seguir tus series
                favoritas y conectar con otros lectores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <SignedIn>
                  <Link href="/dashboard" passHref>
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Comenzar ahora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link href="/books" passHref>
                    <Button size="lg" variant="outline">
                      Explorar catálogo
                    </Button>
                  </Link>
                </SignedIn>

                {/* Usuarios no autenticados abren Clerk y luego redirigen */}
                <SignedOut>
                  <SignInButton
                    mode="redirect"
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                  >
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Comenzar ahora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </SignInButton>

                  <SignInButton
                    mode="redirect"
                    forceRedirectUrl="/books"
                    fallbackRedirectUrl="/books"
                  >
                    <Button size="lg" variant="outline">
                      Explorar catálogo
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative h-[400px] md:h-[500px] w-full">
                {/* Imagen superior derecha: inclinada +2°, al hacer hover gira -2° y hace zoom */}
                <div
                  className="
                    absolute top-0 right-0
                    w-[80%] h-[90%]
                    rounded-lg overflow-hidden
                    shadow-2xl shadow-primary/20
                    transform rotate-2
                    transition-transform duration-300 ease-in-out
                    hover:-rotate-2 hover:scale-105
                  "
                >
                  <Image
                    src={createList}
                    alt="Colección de libros"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Imagen inferior izquierda: inclinada -3°, al hacer hover gira +3° y hace zoom */}
                <div
                  className="
                    absolute bottom-0 left-0
                    w-[70%] h-[80%]
                    rounded-lg overflow-hidden
                    shadow-2xl shadow-primary/20
                    transform -rotate-3 z-20
                    transition-transform duration-300 ease-in-out
                    hover:rotate-3 hover:scale-105
                  "
                >
                  <Image
                    src={membersList}
                    alt="Leyendo libros"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas para tu pasión por la lectura
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Risuto ofrece todas las herramientas para descubrir, organizar y
              disfrutar de tus libros favoritos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 transition-transform hover:scale-105 border border-border">
              <div className="bg-primary/20 p-3 rounded-full w-fit mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Biblioteca Personal
              </h3>
              <p className="text-muted-foreground">
                Organiza tu colección de libros, marca tu progreso de lectura y
                nunca pierdas el hilo de tus series.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 transition-transform hover:scale-105 border border-border">
              <div className="bg-primary/20 p-3 rounded-full w-fit mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Descubrimiento Inteligente
              </h3>
              <p className="text-muted-foreground">
                Recibe recomendaciones personalizadas basadas en tus gustos y
                hábitos de lectura.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 transition-transform hover:scale-105 border border-border">
              <div className="bg-primary/20 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidad Activa</h3>
              <p className="text-muted-foreground">
                Comparte opiniones, participa en discusiones y conecta con otros
                lectores de tus libros favoritos.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 transition-transform hover:scale-105 border border-border">
              <div className="bg-primary/20 p-3 rounded-full w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Tendencias y Novedades
              </h3>
              <p className="text-muted-foreground">
                Mantente al día con los lanzamientos más recientes y los libros
                más populares del momento.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 transition-transform hover:scale-105 border border-border">
              <div className="bg-primary/20 p-3 rounded-full w-fit mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Reseñas y Valoraciones
              </h3>
              <p className="text-muted-foreground">
                Califica tus lecturas y descubre las opiniones de otros usuarios
                para encontrar tu próxima obsesión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Books Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Libros Populares</h2>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/90"
            >
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="gap-6">
            <TrendingBooks books={trendings ?? []} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comienza tu viaje literario hoy
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Únete a Risuto y descubre una nueva forma de disfrutar de tus libros
            favoritos.
          </p>
          <SignedOut>
            <SignUpButton
              mode="redirect"
              forceRedirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
            >
              <Button
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
              >
                Crear cuenta gratis
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </section>
    </div>
  );
}
