import { ORDEM_STATUS_CLIENTE, STATUS_CLIENTE, TIPO_CLIENTE } from "@/lib/datas";
import { type ExtraCliente } from "@/lib/cliente-extra";

export function CamposCliente({
  valores,
}: {
  valores?: {
    nome?: string;
    tipo?: string;
    status?: string;
    contato?: string;
    proximo?: string;
    tags?: string;
    notas?: string;
    extra?: ExtraCliente;
  };
}) {
  const extra = valores?.extra;
  return (
    <>
      <label className="campo">
        Nome
        <input name="nome" required defaultValue={valores?.nome} placeholder="Quem é a pessoa" className="field" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="campo">
          Empresa
          <input name="empresa" defaultValue={extra?.empresa} placeholder="Onde trabalha" className="field" />
        </label>
        <label className="campo">
          Cargo
          <input name="cargo" defaultValue={extra?.cargo} placeholder="O que faz lá" className="field" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="campo">
          Tipo
          <select name="tipo" className="field" defaultValue={valores?.tipo ?? "lead"}>
            {Object.entries(TIPO_CLIENTE).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Status
          <select name="status" className="field" defaultValue={valores?.status ?? "prospeccao"}>
            {ORDEM_STATUS_CLIENTE.map((id) => (
              <option key={id} value={id}>
                {STATUS_CLIENTE[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Origem
          <input
            name="origem"
            defaultValue={extra?.origem}
            placeholder="Indicação, Discord, site…"
            className="field"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="campo">
          E-mail
          <input name="email" type="email" defaultValue={extra?.email} placeholder="email@empresa" className="field" />
        </label>
        <label className="campo">
          Telefone
          <input name="telefone" defaultValue={extra?.telefone} placeholder="Com DDD" className="field" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="campo">
          WhatsApp
          <input name="whatsapp" defaultValue={extra?.whatsapp} placeholder="Se for outro número" className="field" />
        </label>
        <label className="campo">
          Cidade
          <input name="cidade" defaultValue={extra?.cidade} placeholder="Onde está" className="field" />
        </label>
        <label className="campo">
          Documento
          <input name="documento" defaultValue={extra?.documento} placeholder="CNPJ ou CPF, se já tiver" className="field" />
        </label>
      </div>
      <label className="campo">
        Contato na lista
        <input
          name="contato"
          defaultValue={valores?.contato}
          placeholder="O que aparece na lista. Vazio junta telefone e e-mail."
          className="field"
        />
      </label>
      <label className="campo">
        Próximo passo
        <input
          name="proximo"
          defaultValue={valores?.proximo}
          placeholder="O que falta pra esta ficha andar"
          className="field"
        />
      </label>
      <label className="campo">
        Tags
        <input name="tags" defaultValue={valores?.tags} placeholder="Separadas por vírgula" className="field" />
      </label>
      <label className="campo">
        Notas
        <textarea name="notas" rows={4} defaultValue={valores?.notas} placeholder="O que não pode sumir" className="field" />
      </label>
    </>
  );
}
