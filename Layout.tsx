/** @jsx h */
import { h } from "preact";
import { PropsWithChildren } from "https://esm.sh/v94/preact@10.10.0/compat/src/index.d.ts";
import NavBar from "./components/common/navBar/NavBar.tsx";
import Footer from "./components/common/footer/Footer.tsx";

export default function Layout(props: { children: PropsWithChildren}) {
  return (
   <div id="layout">
    <NavBar />

    <main>{props.children}</main>

    <Footer />
   </div>
  );
}
