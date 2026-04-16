import Link from "next/link";
import { FileText, MessageSquareQuote } from "lucide-react";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    href: "/admin/configuracoes/cultura",
    icon: FileText,
    title: "Conteúdo de cultura",
    description: "Edite o manifesto, valores, benefícios e texto de diversidade",
  },
  {
    href: "/admin/configuracoes/depoimentos",
    icon: MessageSquareQuote,
    title: "Depoimentos",
    description: "Gerencie os depoimentos de colaboradores exibidos no site",
  },
];

export default function ConfiguracoesPage() {
  return (
    <div>
      <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
        Configurações
      </h1>
      <p className="mt-1 text-sm text-wt-gray-500">
        Gerencie o conteúdo das páginas públicas
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-wt-md border border-wt-gray-300/60 bg-white p-6 shadow-wt-sm transition-shadow hover:shadow-wt-md"
          >
            <section.icon className="h-8 w-8 text-wt-primary" />
            <h2 className="mt-3 font-wt-heading text-lg font-bold text-wt-teal-deep group-hover:text-wt-primary">
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-wt-gray-500">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
