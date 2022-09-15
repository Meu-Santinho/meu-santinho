/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import ComboBoxSelect from "../components/ui/comboBox/ComboBox.tsx"

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

export default function Home() {
  return (
    <div>
        <div class={tw`p-4 mx-auto max-w-screen-md`}>
          <img
            src="/logo.svg"
            height="100px"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <form method="GET" action="/candidatos">
            <select name="uf">
              {UFs.map((uf) => (
                <option value={uf} key={uf}>
                  {uf}
                </option>
              ))}
            </select>
            <button type="submit">Go</button>
            <ComboBoxSelect />
          </form>
        </div>
    </div>
  );
}
