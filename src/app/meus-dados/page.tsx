import type { Metadata } from "next";
import { LgpdRequestForm } from "./LgpdRequestForm";

export const metadata: Metadata = {
  title: "Meus dados",
  description:
    "Solicite acesso ou exclusão dos seus dados pessoais armazenados pelo Welcome Group (LGPD).",
};

export default function MeusDadosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <div className="mb-10">
        <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.22em] text-wt-primary">
          LGPD
        </p>
        <h1 className="mt-3 font-wt-heading text-4xl font-bold tracking-tight text-wt-teal-deep sm:text-5xl">
          Meus dados
        </h1>
        <p className="mt-4 text-base leading-relaxed text-wt-gray-700">
          A Lei Geral de Proteção de Dados garante a você, titular, o direito
          de solicitar acesso, correção ou exclusão dos dados pessoais que
          armazenamos. Preencha o formulário abaixo e entraremos em contato no
          e-mail informado para confirmar sua identidade antes de atender.
        </p>
      </div>

      <div className="rounded-wt-md bg-white p-6 shadow-wt-sm sm:p-8">
        <LgpdRequestForm />
      </div>

      <div className="mt-10 rounded-wt-md border border-wt-gray-300/60 bg-wt-gray-100/40 p-6">
        <h2 className="font-wt-heading text-sm font-bold uppercase tracking-[0.12em] text-wt-teal-deep">
          O que fazemos com seus dados?
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-wt-gray-700">
          <li>
            • Armazenamos apenas os dados necessários para recrutamento e
            seleção: nome, e-mail, telefone, links profissionais, currículo
            em PDF e informações da vaga pleiteada.
          </li>
          <li>
            • Currículos ficam em bucket privado — não são públicos nem
            indexáveis.
          </li>
          <li>
            • Um pedido de <strong>exclusão</strong> remove sua candidatura
            (e o CV associado) de todas as vagas, assim como seu cadastro no
            banco de talentos, caso exista.
          </li>
          <li>
            • Tratamos solicitações em até 15 dias úteis. Em caso de dúvida,
            fale com <strong>rh@welcomegroup.com.br</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
}
