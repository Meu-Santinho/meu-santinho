/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Candidato } from "../clients/tse.ts";

export default function Candidatos(
  props: {
    uf: string;
    cargos: Array<{ nome: string; candidatos: Candidato[] }>;
  },
) {
  const cargos = props.cargos;
  return (
    <div>
      <div class={tw`flex items-center align-center`}>
        <form
          class={tw`w-1/5`}
          action={`/compartilharImagem/uf=${props.uf}`}
        >
          <div class={tw`flex flex-col `}>
            {cargos.map(({ nome, candidatos }) => (
              <div class={tw`m-2 flex flex-col`}>
                <label class={tw`font-bold`}>{nome}</label>
                <select key={nome} name={nome} class={tw`m-2`}>
                  {candidatos.map(({ nomeUrna, numero, id }) => (
                    <option
                      value={id}
                      key={id}
                    >
                      {`${numero} - ${nomeUrna}`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}
