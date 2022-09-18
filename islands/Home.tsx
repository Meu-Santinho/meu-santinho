/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import Modal from "../components/ui/modal/Modal.tsx";
import Button from "../components/ui/button/Button.tsx";
import SelectHome from "../components/ui/select/SelectHome.tsx";
import Layout from "../Layout.tsx";
import Hero from "../components/ui/hero/Hero.tsx";
import HeaderSection from "../components/ui/headerSection/HeaderSection.tsx";
import Breadcrumb from "../components/ui/breadcrumb/BreadCrumb.tsx";

export default function Home() {
  return (
    <div>
      <Layout>
        <div class={tw`text-center block mb-40`}>
          <HeaderSection title="Meu Santinho" subTitle="Selecione os candidatos que você vai votar e gere seu santinho online. Compartilhe no Instagram e peça sugestões para os cargos que você não escolheu ainda!" />
          <div class={tw`p-4 mx-auto max-w-screen-md`}>
            <form method="GET" action="/candidatos">
              <div class={tw`block text-center`}>
                <div>
                  <label id="selecione" class={tw`font-bold text-xl p-6`}>
                    Selecione seu Estado
                  </label>
                </div>
                <div class={tw`my-8 xl:mx-56 lg:mx-52 md:mx-48 mx-36`}>
                  <SelectHome />
                </div>
                <div>
                  <Button type="submit">Próximo</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </div>
  );
}
