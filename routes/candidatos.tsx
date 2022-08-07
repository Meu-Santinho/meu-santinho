/** @jsx h */
import { h, Fragment } from "preact";
import { tw } from "@twind";
import { PageProps, Handlers } from "$fresh/server.ts";
import tseApi, { Candidato } from "../clients/tse.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const uf = url.searchParams.get("uf");
    if (!uf) {
      return ctx.render();
    }

    const cargos = (await tseApi.listarCandidatos(uf)) as unknown as {
      candidatos: any[];
    };
    return ctx.render({ cargos });
  },
};

export default function Greet(
  props: PageProps<{ cargos: Array<{ nome: string; candidatos: Candidato[] }> }>
) {
  const cargos = props.data.cargos;
  return (
    <div class={tw`flex items-center align-center`}>
      <form class={tw`w-1/5`}>
        <div class={tw`flex flex-col `}>
          {cargos.map(({ nome, candidatos }) => (
            <div class={tw`m-2 flex flex-col`}>
              <label class={tw`font-bold`}>{nome}</label>
              <select key={nome} name={nome} class={tw`m-2`}>
                {candidatos.map(({ nomeUrna, numero, id }) => (
                  <option
                    value={id}
                    key={id}
                  >{`${numero} - ${nomeUrna}`}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
