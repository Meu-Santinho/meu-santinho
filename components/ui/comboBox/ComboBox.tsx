/** @jsx h */
import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { Combobox } from "headlessui";
import { tw } from "@twind";
import { Candidato } from "../../../clients/tse.ts";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function ComboBoxSelect(
  props: { key: string; nome: string; candidatos: Candidato[] },
) {
  const [busca, setBusca] = useState("");
  const [candidatoSelecionado, setCandidatoSelecionado] = useState("");

  const candidatos = props.candidatos;

  const candidatosFiltrados = busca === ""
    ? candidatos
    : candidatos.filter((candidato) => {
      return candidato.nomeUrna.toLowerCase().includes(busca.toLowerCase()) ||
        candidato.numero.toString().includes(busca);
    });

  return (
    //@ts-expect-error: erro
    <Combobox
      name={props.nome}
      as="div"
      value={candidatoSelecionado}
      onChange={setCandidatoSelecionado}
      key={props.key}
    >
      <Fragment>
        <Combobox.Label class={tw`block font-bold text-xl text-gray-black`}>
          {props.nome}
        </Combobox.Label>
        <div class={tw`relative mt-1`}>
          <Combobox.Input
            class={tw`w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm`}
            onChange={(e) => setBusca(e.target.value)}
            displayValue={(candidato: Candidato) =>
              candidato.numero + " " + "-" + " " + candidato.nomeUrna}
          />
          <Combobox.Button
            class={tw`absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none`}
          >
          </Combobox.Button>
          {candidatosFiltrados.length > 0 && (
            <Combobox.Options
              class={tw`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
            >
              {candidatosFiltrados.map((person) => (
                <Combobox.Option
                  key={person.id}
                  value={person.id}
                  class={({ active }: any) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-8 pr-4",
                      active ? "bg-indigo-600 text-white" : "text-gray-900",
                    )}
                >
                  {({ active, selected }: any) => (
                    <Fragment>
                      <span
                        className={classNames(
                          "block truncate",
                          selected && "font-semibold",
                        )}
                      >
                        {`${person.numero} - ${person.nomeUrna}`}
                      </span>

                      {selected && (
                        <span
                          class={classNames(
                            "absolute inset-y-0 left-0 flex items-center pl-1.5",
                            active ? "text-white" : "text-indigo-600",
                          )}
                        >
                        </span>
                      )}
                    </Fragment>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Fragment>
    </Combobox>
  );
}
