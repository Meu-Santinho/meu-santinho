import { Candidato } from "../clients/tse.ts";
import ComboBoxSelect from "../components/ui/comboBox/ComboBox.tsx";
import HeaderSection from "../components/ui/headerSection/HeaderSection.tsx";
import Button from "../components/ui/button/Button.tsx";
import Layout from "../Layout.tsx";

export default function Candidatos(props: {
  uf: string;
  cargos: Array<{ nome: string; candidatos: Candidato[] }>;
}) {
  const cargos = props.cargos;

  return (
    <Layout>
      <div class="items-center text-center my-8">
        <div class="max-w-7xl mx-auto py-4 px-8 sm:px-16 md:px-64 lg:px-96">
          <div class="text-center">
            <form autocomplete="off" action={`/compartilhar-imagem`}>
              <input type="hidden" name="uf" value={props.uf} />
              <div class="flex flex-col ">
                {cargos.map(({ nome, candidatos }) => (
                  <div>
                    {props.uf === "DF" && nome === "Deputado Estadual"
                      ? ""
                      : props.uf !== "DF" && nome === "Deputado Distrital"
                      ? ""
                      : (
                        <div class="m-2 flex flex-col">
                          <ComboBoxSelect
                            key={nome}
                            nome={nome}
                            candidatos={candidatos}
                          />
                        </div>
                      )}
                  </div>
                ))}
              </div>
              <div class="mt-10">
                <Button type="submit">Gerar Imagens</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
