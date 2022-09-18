/** @jsx h */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import { Disclosure, Menu, Transition } from "headlessui";
import Navigator from "./Navigator.tsx";

const menuNavigation = [
  { nome: "Contato", href: "/contato" },
  { nome: "Home", href: "/" },
];

export default function NavBar() {
  return (
    <Disclosure as="nav" class={tw`bg-black shadow`}>
      {/* @ts-expect-error: erro */}
      {({ open }: any) => (
        <Fragment>
          <div class={tw`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
            <div class={tw`flex justify-between h-16`}>
              <div class={tw`flex`}>
                <div class={tw`flex-shrink-0 flex items-center`}>
                  <a href="/">
                    <span
                      class={tw`mt-1 text-lg font-extrabold text-white sm:text-lg sm:tracking-tight lg:text-xl`}
                    >
                      Meu Santinho
                    </span>
                  </a>
                </div>
              </div>
              <Navigator />
              <div class={tw`-mr-2 flex items-center sm:hidden`}>
                <Disclosure.Button
                  class={tw`inline-flex items-center justify-center py-2 px-4 rounded-md text-white hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:transition-all`}
                >
                  {/* @ts-expect-error: erro */}
                  <Fragment>
                    <span class={tw`sr-only`}>Open main menu</span>
                    {open ? "X" : (
                      "Menu"
                    )}
                  </Fragment>
                </Disclosure.Button>
              </div>
            </div>
          </div>
          
          {menuNavigation.map((option) => (
            <Disclosure.Panel class={tw`sm:hidden`}>
              {/* @ts-expect-error: erro */}
              <div class={tw`pt-1 pb-2 space-y-1`}>
                <Disclosure.Button
                  class={tw`bg-white border-gray-700 text-black block pl-3 pr-4 py-2 border-l-4 text-base font-medium hover:border-white hover:text-black hover:bg-gray-200 hover:transition-all hover:ease-out rounded-r-md`}
                >
                  {option.nome}
                </Disclosure.Button>
              </div>
            </Disclosure.Panel>
          ))}
        </Fragment>
      )}
    </Disclosure>
  );
}
