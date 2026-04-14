import type { Metadata } from "next";
import { TalentPoolForm } from "@/components/public/TalentPoolForm";

export const metadata: Metadata = {
  title: "Banco de Talentos",
  description:
    "Cadastre-se no banco de talentos do Welcome Group e seja avisado quando surgir uma vaga na sua área.",
};

export default function BancoDeTalentosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <div className="mb-10">
        <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.2em] text-wt-primary">
          Banco de talentos
        </p>
        <h1 className="mt-3 font-wt-heading text-4xl font-bold tracking-tight text-wt-teal-deep sm:text-5xl">
          Quer ser <span className="text-wt-primary">Welcome</span>?
        </h1>
        <p className="mt-5 text-base leading-relaxed text-wt-gray-700">
          Não encontrou a vaga ideal? Cadastre-se no nosso banco de talentos.
          Quando uma oportunidade compatível com o seu perfil surgir, entraremos
          em contato.
        </p>
      </div>

      <div className="rounded-wt-md bg-white p-6 shadow-wt-sm sm:p-10">
        <TalentPoolForm />
      </div>
    </div>
  );
}
