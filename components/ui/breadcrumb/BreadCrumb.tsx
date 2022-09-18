/** @jsx h */
import { Fragment, h } from "preact";
import { tw } from "@twind";

export default function Breadcrumb() {
  return (
    <Fragment aria-label="Breadcrumb">
      <div
        class={tw`bg-gray-200 border-b border-gray-200 align-center items-center text-center`}
      >
        <div class={tw`block p-4`}>
          <label
            class={tw`mt-1 font-extrabold text-gray-900 sm:tracking-tight text-xl`}
          >
            Mapa do Brasil
          </label>
        </div>
        <div class={tw`flex justify-center p-4`}>
          <img
            src="https://www.nicepng.com/png/full/415-4159495_selecione-um-estado-para-ver-suas-unidades-transparente.png"
            class={tw`w-56 h-56`}
          />
        </div>
      </div>
    </Fragment>
  );
}
