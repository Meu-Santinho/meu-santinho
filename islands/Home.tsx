import Button from "../components/ui/button/Button.tsx";
import SelectUF from "../components/ui/select/SelectUF.tsx";
import Layout from "../Layout.tsx";
import HeaderSection from "../components/ui/headerSection/HeaderSection.tsx";

export default function Home() {
  return (
    <div>
      <Layout>
        <div class="flex items-center flex-col">
          <HeaderSection title="" subTitle="" />
          <div class="p-4 mx-auto max-w-screen-md">
            <form method="GET" action="/candidatos">
              <div class="block text-center">
                <div>
                  <label id="selecione" class="font-bold text-xl p-6">
                    Selecione seu Estado
                  </label>
                </div>
                <div class="my-8 xl:mx-56 md:mx-48">
                  <SelectUF />
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
