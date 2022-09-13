/** @jsx h */
import { Fragment, h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import tseApi, { Candidato } from "../clients/tse.ts";
import Candidatos from "../islands/Candidatos.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const uf = url.searchParams.get("uf");
    if (!uf) {
      return ctx.render();
    }

    const cargos = (await tseApi.listarCandidatos(uf)) as unknown as {
      candidatos: Candidato[];
    };
    return ctx.render({ cargos, uf });
  },
};

export default function Greet(
  props: PageProps<
    { cargos: Array<{ nome: string; candidatos: Candidato[] }>; uf: string }
  >,
) {
  const cargos = props.data.cargos;
  const uf = props.data.uf;

  return (
    <div>
      <Candidatos cargos={cargos} uf={uf} />
    </div>
  );
}
