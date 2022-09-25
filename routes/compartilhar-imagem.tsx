import { Handlers, PageProps } from "$fresh/server.ts";
import tseApi, { infosCandidato } from "../clients/tse.ts";
import GerarSantinho from "../islands/GerarSantinho.tsx";
import Layout from "../Layout.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const uf = url.searchParams.get("uf");
    const governador = url.searchParams.get("Governador");
    const senador = url.searchParams.get("Senador");
    const depEstadual = url.searchParams.get("Deputado Estadual");
    const depFederal = url.searchParams.get("Deputado Federal");
    const presidente = url.searchParams.get("Presidente");
    const depDistrital = url.searchParams.get("Deputado Distrital");
    if (!uf || !governador || !senador || !depFederal || !presidente) {
      return ctx.render();
    }

    const [
      infosGovernador,
      infosSenador,
      infosDepEstadual,
      infosDepFederal,
      infosPresidente,
      infosDepDistrital,
    ] = await Promise.all([
      tseApi.infosCandidato(uf, governador) as unknown as {
        infosCandidato: infosCandidato;
      },
      tseApi.infosCandidato(uf, senador ?? senador) as unknown as {
        infosCandidato: infosCandidato;
      },
      tseApi.infosCandidato(uf, depEstadual ? depEstadual : "0") as unknown as {
        infosCandidato: infosCandidato;
      },
      tseApi.infosCandidato(uf, depFederal ?? depFederal) as unknown as {
        infosCandidato: infosCandidato;
      },
      tseApi.infosCandidato("BR", presidente ?? presidente) as unknown as {
        infosCandidato: infosCandidato;
      },
      tseApi.infosCandidato(
        uf,
        depDistrital ? depDistrital : "0"
      ) as unknown as {
        infosCandidato: infosCandidato;
      },
    ]);

    return ctx.render({
      uf,
      infosGovernador,
      infosSenador,
      infosDepEstadual,
      infosDepFederal,
      infosPresidente,
      infosDepDistrital,
    });
  },
};

export default function Greet(
  props: PageProps<{
    uf: string;
    infosGovernador: infosCandidato;
    infosSenador: infosCandidato;
    infosDepEstadual: infosCandidato;
    infosDepFederal: infosCandidato;
    infosPresidente: infosCandidato;
    infosDepDistrital: infosCandidato;
  }>
) {
  const governador = props.data.infosGovernador;
  const senador = props.data.infosSenador;
  const deputadoestadual = props.data.infosDepEstadual;
  const deputadofederal = props.data.infosDepFederal;
  const presidente = props.data.infosPresidente;
  const deputadodistrital = props.data.infosDepDistrital;

  return (
    <Layout>
      <div class="flex items-center flex">
        <GerarSantinho
          uf={props.data.uf}
          candidatos={{
            governador,
            deputadoestadual,
            senador,
            deputadofederal,
            presidente,
            deputadodistrital,
          }}
        />
      </div>
    </Layout>
  );
}
