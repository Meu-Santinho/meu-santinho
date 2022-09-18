/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Candidato } from "../clients/tse.ts";
import ComboBoxSelect from "../components/ui/comboBox/ComboBox.tsx";
import HeaderSection from "../components/ui/headerSection/HeaderSection.tsx";
import Button from "../components/ui/button/Button.tsx";
import Layout from "../Layout.tsx";

export default function Candidatos(
  props: {
    uf: string;
    cargos: Array<{ nome: string; candidatos: Candidato[] }>;
  },
) {
  const cargos = props.cargos;

  return (
    <Layout>
      <div class={tw`items-center align-center text-center mb-10`}>
        <HeaderSection title="Meu Santinho" subTitle="Escolha seus candidatos, gere a imagem e compartilhe seu santinho online no Instagram!"/>
        <div class={tw`max-w-7xl mx-auto py-4 px-8 sm:px-16 md:px-64 lg:px-96`}>
          <div class={tw`text-center`}>
            <form
              autocomplete="off"
              action={`/compartilhar-imagem`}
            >
              <input type="hidden" name="uf" value={props.uf} />
              <div class={tw`flex flex-col `}>
                {cargos.map(({ nome, candidatos }) => (
                  <div class={tw`m-2 flex flex-col`}>
                    <ComboBoxSelect
                      key={nome}
                      nome={nome}
                      candidatos={candidatos}
                    />
                  </div>
                ))}
              </div>
              <div class={tw`mt-10`}>
                <Button type="submit">Gerar Imagens</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
