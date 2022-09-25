import { PropsWithChildren } from "https://esm.sh/v94/preact@10.10.0/compat/src/index.d.ts";
import Logo from "./components/common/Logo.tsx";
import Footer from "./components/common/footer/Footer.tsx";

export default function Layout(props: { children: PropsWithChildren }) {
  return (
    <div id="layout" class="h-screen">
      <div class="mt-12">
        <Logo />
      </div>

      <main>{props.children}</main>

      <Footer />
    </div>
  );
}
