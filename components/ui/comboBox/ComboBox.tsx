/** @jsx h */
import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { Combobox } from "headlessui";
import { tw } from "@twind";
import { Candidato } from "../../../clients/tse.ts";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ComboBoxSelect(
  props: { key: string; nome: string; candidatos: Candidato[] },
) {
  const [busca, setBusca] = useState("");
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<
    number | null
  >(null);

  const candidatos = props.candidatos;

  const candidatosFiltrados = busca === ""
    ? candidatos
    : candidatos.filter((candidato) => {
      return candidato.nomeUrna.toLowerCase().includes(busca.toLowerCase()) ||
        candidato.numero.toString().includes(busca);
    });

  const candidato = props.candidatos.find(({ id }) =>
    id === candidatoSelecionado
  );

  return (
    <Combobox
      name={props.nome}
      as="div"
      //@ts-ignore : erro
      value={candidatoSelecionado || 0}
       //@ts-ignore : erro
      onChange={setCandidatoSelecionado}
      key={props.key}
    >
     {/* @ts-expect-error: erro */}
      <Fragment>
        <Combobox.Label class={tw`block font-bold text-xl text-gray-black`}>
          {props.nome}
        </Combobox.Label>
        <div class={tw`relative mt-1`}>
          <Combobox.Input
            class={tw`w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm`}
            onChange={(e) => setBusca((e.target as HTMLInputElement).value)}
            placeholder="Busque por número ou nome"
            displayValue={() =>
              candidato
                ? candidato?.numero + " " + "-" + " " + candidato?.nomeUrna
                : ""}
          />
          <Combobox.Button
            class={tw`absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none`}
          >
          </Combobox.Button>
          {candidatosFiltrados.length > 0 && (
            <Combobox.Options
              class={tw`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
            >
              {/* @ts-expect-error: erro */}
              {candidatosFiltrados.map((person) => (
                <Combobox.Option
                  key={person.id}
                  value={person.id}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-8 pr-4",
                      active ? "bg-indigo-600 text-white" : "text-gray-900",
                    )}
                >
                  {/* @ts-expect-error: erro */}
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
