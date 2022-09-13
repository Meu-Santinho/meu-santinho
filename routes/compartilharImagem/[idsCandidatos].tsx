/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";
import tseApi, { infosCandidato } from "../../clients/tse.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;
    const uf = path.substring(23, 25);
    const governador = url.searchParams.get("Governador");
    const senador = url.searchParams.get("Senador");
    const depEstadual = url.searchParams.get("Deputado Estadual");
    const depFederal = url.searchParams.get("Deputado Federal");
    if (!uf || !governador || !senador || !depEstadual || !depFederal) {
      return ctx.render();
    }

    const [infosGovernador, infosSenador, infosDepEstadual, infosDepFederal] =
      await Promise.all(
        [
          tseApi.infosCandidato(uf, governador) as unknown as {
            infosCandidato: infosCandidato;
          },
          tseApi.infosCandidato(uf, senador) as unknown as {
            infosCandidato: infosCandidato;
          },
          tseApi.infosCandidato(uf, depEstadual) as unknown as {
            infosCandidato: infosCandidato;
          },
          tseApi.infosCandidato(uf, depFederal) as unknown as {
            infosCandidato: infosCandidato;
          },
        ],
      );

    return ctx.render({
      infosGovernador,
      infosSenador,
      infosDepEstadual,
      infosDepFederal,
    });
  },
};

export default function Greet(
  props: PageProps<
    {
      infosGovernador: infosCandidato;
      infosSenador: infosCandidato;
      infosDepEstadual: infosCandidato;
      infosDepFederal: infosCandidato;
    }
  >,
) {
  const governador = props.data.infosGovernador;
  const senador = props.data.infosSenador;
  const depEstadual = props.data.infosDepEstadual;
  const depFederal = props.data.infosDepFederal;

  return (
    <div class={tw`flex items-center flex`}>
      <div>
        <label>{governador.nomeUrna}</label>
        <img src={governador.fotoUrl} class={tw`w-10 h-10`} />
      </div>
      <div>
        <label>{senador.nomeUrna}</label>
        <img src={senador.fotoUrl} class={tw`w-10 h-10`} />
      </div>
      <div>
        <label>{depEstadual.nomeUrna}</label>
        <img src={depEstadual.fotoUrl} class={tw`w-10 h-10`} />
      </div>

      <div>
        <label>{depFederal.nomeUrna}</label>
        <img src={depFederal.fotoUrl} class={tw`w-10 h-10`} />
      </div>
    </div>
  );
}
