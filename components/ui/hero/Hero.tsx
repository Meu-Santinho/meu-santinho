/** @jsx h */
import { Fragment, h } from "preact";
import { tw } from "@twind";

export default function Hero() {
  return (
    <main class={tw`lg:relative`}>
        <div
          class={tw`mx-auto max-w-7xl w-full pt-16 pb-20 text-center lg:py-48 lg:text-left`}
        >
          <div class={tw`px-4 lg:w-1/2 sm:px-8 xl:pr-16`}>
            <h1
              class={tw`text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl`}
            >
              <span class={tw`block xl:inline`}>Meu Santinho</span>
              {" "}
            </h1>
            <p
              class={tw`mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl`}
            >
              Escolha seus candidatos a partir da sua unidedade federativa e
              compartilhe a imagem do santinho no instagram!
            </p>
            <div class={tw`mt-10 sm:flex sm:justify-center lg:justify-start`}>
              <div class={tw`rounded-md shadow`}>
                <a
                  href="#selecione"
                  class={tw`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 md:py-4 md:text-lg md:px-10`}
                >
                  Começar
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          class={tw`relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full`}
        >
          <img
            class={tw`absolute inset-0 w-full h-full object-cover`}
            src="https://static.portaldacidade.com/unsafe/https://s3.amazonaws.com/registro.portaldacidade.com/img/news/2022-09/consulte-informacoes-de-candidatas-e-candidatos-nas-eleicoes-de-2022-63232dd12c5e7.jpg"
            alt=""
          />
        </div>
    </main>
  );
}
