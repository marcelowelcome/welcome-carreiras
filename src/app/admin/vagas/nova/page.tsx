import { JobFormEditor } from "@/components/admin/JobFormEditor";

export default function NovaVagaPage() {
  return (
    <div>
      <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
        Nova vaga
      </h1>
      <p className="mt-1 text-sm text-wt-gray-500">
        Preencha os dados da vaga. Você pode salvar como rascunho ou publicar
        diretamente.
      </p>

      <div className="mt-8">
        <JobFormEditor />
      </div>
    </div>
  );
}
