/** @jsx h */
import { useEffect } from "preact/hooks";
import { h } from "preact";
import { template } from "../utils/template.js";

type Cargos =
  | "governador"
  | "presidente"
  | "deputadoestadual"
  | "deputadofederal"
  | "senador";

type DadosCandidato = {
  nomeUrna: string;
  fotoUrl: string;
  numero: number;
};
export interface Props {
  candidatos: Record<Cargos, DadosCandidato>;
}

export default function GerarSantinho({ candidatos }: Props) {
  useEffect(() => {
    console.log(candidatos);
    const canvas = document.createElement("canvas");

    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    // Colocar template no canva
    const img = new Image(); // Create new img element
    img.src = template;

    img.onload = () => {
      ctx?.drawImage(img, 0, 1, 1080, 1920);

      const preencheCandidato = ({
        yNome,
        yNumero,
        nomeUrna: nome,
        numero,
        yImage,
        fotoUrl,
      }) => {
        if (!ctx) {
          return;
        }

        // //img do candidato
        // const img_candidato = new Image();
        // img_candidato.src =
        //   "https://meu-santinho-proxy.deno.dev/candidaturas/oficial/2022/BR/BA/546/candidatos/910005/foto.jpeg?a";

        // img_candidato.onload = () => {
        //   ctx.drawImage(img_candidato, 0, 1, 100, 100);
        // };

        ctx.fillStyle = "#FFFFFF";
        console.log(nome);
        const fontSize = nome.length > 15 ? "64" : "90";

        ctx.font = `bold ${fontSize}px 'Source Sans Pro'`;

        ctx.fillText(nome, 393, yNome);
        ctx.fillStyle = "#004258";
        ctx.font = `bold 128px 'Source Sans Pro'`;

        numero
          .toString()
          .split("")
          .forEach((algarismo, i) => {
            ctx.fillText(algarismo, 410 + i * 135, yNumero);
          });
      };
      [
        {
          yNome: 165,
          yNumero: 320,
          ...candidatos.deputadoestadual,
          yImage: 165,
        },
        {
          yNome: 525,
          yNumero: 670,
          ...candidatos.deputadofederal,
          yImage: 165,
        },
        { yNome: 885, yNumero: 1015, ...candidatos.senador, yImage: 165 },
        { yNome: 1230, yNumero: 1370, ...candidatos.governador, yImage: 165 },
        { yNome: 1590, yNumero: 1715, ...candidatos.governador, yImage: 165 },
      ].forEach(preencheCandidato);
      var output = new Image();
      output.src = canvas.toDataURL();
      const div = document.querySelector("#output");
      output.style.width = "100%";
      div?.appendChild(output);
    };
  }, []);

  const gerarImagem = () => {
    const canvas = document.createElement("canvas");

    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    // Colocar template no canva
    const img = new Image(); // Create new img element
    img.src = template;

    img.onload = () => {
      ctx?.drawImage(img, 0, 1, 1080, 1920);

      const preencheCandidato = ({
        yNome,
        yNumero,
        nomeUrna: nome,
        numero,
        yImage,
        fotoUrl,
      }) => {
        if (!ctx) {
          return;
        }

        // //img do candidato
        // const img_candidato = new Image();
        // img_candidato.src =
        //   "https://meu-santinho-proxy.deno.dev/candidaturas/oficial/2022/BR/BA/546/candidatos/910005/foto.jpeg?a";

        // img_candidato.onload = () => {
        //   ctx.drawImage(img_candidato, 0, 1, 100, 100);
        // };

        ctx.fillStyle = "#FFFFFF";
        console.log(nome);
        const fontSize = nome.length > 15 ? "64" : "90";

        ctx.font = `bold ${fontSize}px 'Source Sans Pro'`;

        ctx.fillText(nome, 393, yNome);
        ctx.fillStyle = "#004258";
        ctx.font = `bold 128px 'Source Sans Pro'`;

        numero
          .toString()
          .split("")
          .forEach((algarismo, i) => {
            ctx.fillText(algarismo, 410 + i * 135, yNumero);
          });
      };
      [
        {
          yNome: 165,
          yNumero: 320,
          ...candidatos.deputadoestadual,
          yImage: 165,
        },
        {
          yNome: 525,
          yNumero: 670,
          ...candidatos.deputadofederal,
          yImage: 165,
        },
        { yNome: 885, yNumero: 1015, ...candidatos.senador, yImage: 165 },
        { yNome: 1230, yNumero: 1370, ...candidatos.governador, yImage: 165 },
        { yNome: 1590, yNumero: 1715, ...candidatos.governador, yImage: 165 },
      ].forEach(preencheCandidato);
      canvas.toBlob(async (blob) => {
        // Even if you want to share just one file you need to
        // send them as an array of files.
        if (!blob) {
          return;
        }
        const files = [new File([blob], "image.png", { type: blob.type })];
        const shareData = {
          text: "Some text",
          title: "Some title",
          files,
        };
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            if (err.name !== "AbortError") {
              console.error(err.name, err.message);
            }
          }
        } else {
          console.warn("Sharing not supported", shareData);
        }
      });
    };
  };

  return (
    <div>
      <div style="display: flex; justify-content: center;">
        <div
          id="output"
          style="width: 300px; height: 533px; background-color: #069;"
        ></div>
      </div>
      <img />
      <button
        onClick={(e) => {
          e.preventDefault();
          gerarImagem();
        }}
      >
        Compartilhar
      </button>
    </div>
  );
}
