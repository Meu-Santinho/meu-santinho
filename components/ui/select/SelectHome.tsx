/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";

const UFs = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export default function SelectHome() {
  return (
    <select
      id="select-uf"
      name="uf"
      class={tw`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border-1 border-black`}
    >
      {UFs.map((uf) => (
        <option value={uf} key={uf}>
          {uf}
        </option>
      ))}
    </select>
  );
}
