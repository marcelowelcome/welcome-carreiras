import Image from "next/image";

export function ManifestoSection() {
  return (
    <section className="bg-wt-off-white py-20 sm:py-24">
      <div className="mx-auto max-w-wt-container px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Texto */}
          <div>
            <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.22em] text-wt-primary">
              Quem somos
            </p>
            <h2 className="mt-4 font-wt-heading text-3xl font-bold leading-[1.1] tracking-tight text-wt-teal-deep sm:text-4xl lg:text-5xl">
              Há 20 anos transformando{" "}
              <span className="text-wt-primary">sonhos em destinos</span>.
            </h2>

            <div className="mt-8 space-y-4 text-base leading-relaxed text-wt-gray-700 sm:text-lg">
              <p>
                Somos um grupo apaixonado por criar experiências que deixam
                marca. Viagens, casamentos, eventos de networking — tudo
                atravessado por um mesmo cuidado: olhar pra pessoa do outro
                lado como protagonista da própria história.
              </p>
              <p>
                Crescer aqui é crescer cercado de gente que valoriza curiosidade,
                autonomia e empatia. Valorizamos quem faz, quem arrisca, quem
                ensina — e quem lembra o time inteiro de comemorar cada
                conquista.
              </p>
              <p>
                Se você também acredita que carreira boa é construída com as
                pessoas certas ao lado, você chegou no lugar certo.
              </p>
            </div>
          </div>

          {/* Imagem circular */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative h-[400px] w-[400px] sm:h-[480px] sm:w-[480px] lg:h-[560px] lg:w-[560px]">
              <Image
                src="/imagens/Quem-Somos.png"
                alt="Equipe Welcome Group"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-contain"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
