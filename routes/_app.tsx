import { asset, Head } from "$fresh/runtime.ts";
import { AppProps } from "$fresh/server.ts";

export default function App(props: AppProps) {
  return (
    <>
      <Head>
        <title>Meu Santinho - Gere o seu e compartilhe online</title>
        <meta
          name="title"
          content="Meu Santinho - Gere seu santinho e compartilhe online"
        />
        <meta
          name="description"
          content="Preencha com os candidatos que você já escolheu que vai votar nas eleições de 2022. Compartilhe seu santinho no Instagram."
        />
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;700&display=swap');
        </style>
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://meusantinho.app/" />
        <meta
          property="og:title"
          content="Meu Santinho - Gere seu santinho virtual"
        />
        <meta
          property="og:description"
          content="Preencha com os candidatos que você já escolheu que vai votar nas eleições de 2022. Compartilhe seu santinho nas redes."
        />
        <meta property="og:image" content={asset(`/zapzap.png`)} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Meu Santinho - Gere seu santinho virtual" />
        <meta name="twitter:description" content="Preencha com os candidatos que você já escolheu que vai votar nas eleições de 2022. Compartilhe seu santinho nas redes.0" />
        <meta name="twitter:image" content={asset('/twitter.png')} />

        <meta
          property="twitter:description"
          content="Preencha com os candidatos que você já escolheu que vai votar nas eleições de 2022. Compartilhe seu santinho no Instagram."
        />
        {/* TODO: logos */}
        <meta property="twitter:image" content={asset(`/logo.png`)} />
        <meta name="theme-color" content="#3c31dd" />
        <link rel="icon" type="image/png" href={asset("/favicon.png")} />
      </Head>
      <props.Component />
    </>
  );
}
