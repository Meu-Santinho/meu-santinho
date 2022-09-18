/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";


export default function HeaderSection() {
    return (
      <div class={tw`bg-white`}>
        <div class={tw`max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8`}>
          <div class={tw`text-center`}>
            <p class={tw`mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl`}>
              Meu Santinho
            </p>
            <p class={tw`max-w-xl mt-5 mx-auto text-xl text-gray-500`}>
              Escolha seus candidatos e compartilhe a imagem no instagram!
            </p>
          </div>
        </div>
      </div>
    )
  }