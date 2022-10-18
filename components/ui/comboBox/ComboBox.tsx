import { useState } from "preact/hooks";
import { Combobox } from "headlessui";
import { Candidato } from "../../../clients/tse.ts";
import { Fragment } from "preact";
import { ChevronUpDownIcon, CheckIcon } from "heroicons";

export default function ComboBoxSelect(props: {
  key: string;
  nome: string;
  candidatos: Candidato[];
}) {
  const [busca, setBusca] = useState("");
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<
    number | null
  >(null);
  const [isOpen, setIsOpen] = useState(false);

  const candidatos = props.candidatos;

  const candidatosFiltrados =
    busca === ""
      ? candidatos
      : candidatos.filter((candidato) => {
          return (
            candidato.nomeUrna.toLowerCase().includes(busca.toLowerCase()) ||
            candidato.numero.toString().includes(busca)
          );
        });

  const candidato = props.candidatos.find(
    ({ id }) => id === candidatoSelecionado
  );

  return (
    <Combobox
      name={props.nome}
      as="div"
      //@ts-ignore : erro
      value={candidatoSelecionado || 0}
      //@ts-ignore : erro
      onChange={() => {
        setCandidatoSelecionado;
        setIsOpen(!open);
      }}
      key={props.key}
    >
      {/* @ts-expect-error: erro */}
      {({ open }) => (
        <Fragment>
          <Combobox.Label class="relative mt-1">{props.nome}</Combobox.Label>
          <div class="relative mt-1">
            <Combobox.Input
              class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm text-black font-semibold"
              onChange={(e) => setBusca((e.target as HTMLInputElement).value)}
              placeholder="Busque por número ou nome"
              displayValue={() =>
                candidato
                  ? candidato?.numero + " " + "-" + " " + candidato?.nomeUrna
                  : ""
              }

              onFocus={() => {
                setIsOpen(!open);
              }}
            />
            <Combobox.Button class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
            {candidatosFiltrados.length > 0 && (isOpen || open) && (
              <Combobox.Options
                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                {/* @ts-expect-error: erro */}
                {candidatosFiltrados.map((candidato) => (
                  <Combobox.Option
                    key={candidato.id}
                    value={candidato.id}
                    class="relative cursor-pointer select-none text-black font-semibold text-lg hover:bg-gray-200 text-left"
                  >
                    {/* @ts-expect-error: erro */}
                    {({ active, selected }: any) => (
                      <Fragment>
                        <li
                          class={`py-2 pl-2 pr-2 ${
                            active
                              ? "bg-black text-white "
                              : "bg-white text-black "
                          }`}
                          onClick={() => {
                            setCandidatoSelecionado(candidato.id);
                          }}
                        >
                          {`${candidato.numero} - ${candidato.nomeUrna}`}
                        </li>
                      </Fragment>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        </Fragment>
      )}
    </Combobox>
  );
}
