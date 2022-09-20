import { Handlers, PageProps } from "$fresh/server.ts";
import tseApi, { infosCandidato } from "../clients/tse.ts";
import GerarSantinho from "../islands/GerarSantinho.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const uf = url.searchParams.get("uf");
    const governador = url.searchParams.get("Governador");
    const senador = url.searchParams.get("Senador");
    const depEstadual = url.searchParams.get("Deputado Estadual");
    const depFederal = url.searchParams.get("Deputado Federal");
    if (!uf || !governador || !senador || !depEstadual || !depFederal) {
      return ctx.render();
    }

    const [infosGovernador, infosSenador, infosDepEstadual, infosDepFederal] =
      await Promise.all([
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
      ]);

    return ctx.render({
      infosGovernador,
      infosSenador,
      infosDepEstadual,
      infosDepFederal,
    });
  },
};

export default function Greet(
  props: PageProps<{
    infosGovernador: infosCandidato;
    infosSenador: infosCandidato;
    infosDepEstadual: infosCandidato;
    infosDepFederal: infosCandidato;
  }>
) {
  const governador = props.data.infosGovernador;
  const senador = props.data.infosSenador;
  const deputadoestadual = props.data.infosDepEstadual;
  const deputadofederal = props.data.infosDepFederal;
  return (
    <div class="flex items-center flex">
      <GerarSantinho
        candidatos={{ governador, deputadoestadual, senador, deputadofederal }}
      />
    </div>
  );
}
