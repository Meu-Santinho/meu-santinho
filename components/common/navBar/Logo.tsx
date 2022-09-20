import { tw } from "twind";
import { Disclosure } from "headlessui";
import Navigator from "./Navigator.tsx";

const menuNavigation = [
  { nome: "Contato", href: "/contato" },
  { nome: "Home", href: "/" },
];

export default function Logo() {
  return (
    <div class=" mt-24">
      <img src="/Vector.svg" class="w-10/12 h-10 m-auto"></img>
    </div>
  );
}
