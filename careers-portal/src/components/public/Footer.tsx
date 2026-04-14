import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/vagas", label: "Vagas" },
  { href: "/cultura", label: "Cultura" },
  { href: "/banco-de-talentos", label: "Banco de Talentos" },
];

const BRANDS = [
  "Welcome Weddings",
  "Welcome Trips",
  "WelConnect",
];

export function Footer() {
  return (
    <footer className="bg-wt-teal-deep text-white">
      <div className="mx-auto max-w-wt-container px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sobre */}
          <div>
            <h3 className="font-wt-heading text-lg font-bold">
              Welcome <span className="text-wt-yellow">Carreiras</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Construa sua carreira em um grupo que transforma sonhos em
              destinos. Turismo, eventos e experiências que conectam pessoas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-wt-heading text-xs font-bold uppercase tracking-[0.15em] text-white/60">
              Navegação
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/85 transition-colors hover:text-wt-yellow"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marcas */}
          <div>
            <h4 className="font-wt-heading text-xs font-bold uppercase tracking-[0.15em] text-white/60">
              Nossas Marcas
            </h4>
            <ul className="mt-4 space-y-3">
              {BRANDS.map((brand) => (
                <li key={brand} className="text-sm text-white/85">
                  {brand}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-center text-xs text-white/55">
          &copy; {new Date().getFullYear()} Welcome Group. Todos os direitos
          reservados. Curitiba, PR.
        </div>
      </div>
    </footer>
  );
}
