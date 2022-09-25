import { useEffect } from "preact/hooks";
import { template } from "../utils/template.js";
import Button from "../components/ui/button/Button.tsx";
import Logo from "../components/common/Logo.tsx";

const SANTINHO_WIDTH = 1080;
const SANTINHO_HEIGHT = 1920;

type Cargos =
  | "governador"
  | "presidente"
  | "deputadoestadual"
  | "deputadofederal"
  | "deputadodistrital"
  | "senador";

type DadosCandidato = {
  nomeUrna: string;
  fotoUrl: string;
  numero: number;
};

export interface Props {
  candidatos: Record<Cargos, DadosCandidato>;
}

const loadImage = (fotoUrl: string) => {
  const candImg = new Image();
  candImg.crossOrigin = "anonymous";
  candImg.src = fotoUrl.replace(
    "divulgacandcontas.tse.jus.br/",
    "meu-santinho-proxy.deno.dev/"
  );
  return new Promise<typeof candImg>((res) => {
    candImg.onload = () => {
      res(candImg);
    };
  });
};

export default function GerarSantinho({ candidatos }: Props) {
  const infosCandidatos = [
    {
      numeroDefault: "00000",
      yNome: 175,
      yNumero: 320,
      ...(candidatos.deputadoestadual || candidatos.deputadodistrital),
      yImage: 39,
    },
    {
      numeroDefault: "0000",
      yNome: 525,
      yNumero: 670,
      ...candidatos.deputadofederal,
      yImage: 386,
    },
    {
      numeroDefault: "000",
      yNome: 865,
      yNumero: 1015,
      ...candidatos.senador,
      yImage: 732,
    },
    {
      numeroDefault: "00",
      yNome: 1220,
      yNumero: 1370,
      ...candidatos.governador,
      yImage: 1084,
    },
    {
      numeroDefault: "00",
      yNome: 1570,
      yNumero: 1715,
      ...candidatos.presidente,
      yImage: 1435,
    },
  ];

  useEffect(() => {
    const drawSantinho = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = SANTINHO_WIDTH;
      canvas.height = SANTINHO_HEIGHT;

      const bg = await loadImage(template);

      ctx?.drawImage(bg, 0, 0, SANTINHO_WIDTH, SANTINHO_HEIGHT);

      const candidatosPromise = infosCandidatos.map(
        async ({
          yImage,
          yNome,
          yNumero,
          numero,
          nomeUrna,
          fotoUrl,
          numeroDefault,
        }) => {
          const candidatoImg = await loadImage(
            fotoUrl ??
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCRRNhPDfP_n9gWbDrSMba6bR4dgsxSRE353R59IPfQIx_ypmeOt1sXNMKCHRmYuLPRrk&usqp=CAU"
          );

          if (!ctx) {
            return;
          }

          const preencheNomeNumero = () => {
            ctx.fillStyle = "#FFFFFF";
            const fontSize = nomeUrna.length > 15 ? "64" : "90";

            const fontSizeNome = (() => {
              if (nomeUrna.length < 5) {
                return "100";
              } else if (nomeUrna.length < 16) {
                return "75";
              } else {
                return "58";
              }
            })();

            ctx.font = `bold ${fontSizeNome}px 'Source Sans Pro'`;

            ctx.fillText(nomeUrna ?? "Não escolhido", 393, yNome);
            ctx.fillStyle = "#004258";
            ctx.font = `bold 128px 'Source Sans Pro'`;

            {
              numero
                ? numero
                    .toString()
                    .split("")
                    .forEach((algarismo: string, i: number) => {
                      ctx.fillText(algarismo, 410 + i * 135, yNumero);
                    })
                : numeroDefault
                    .split("")
                    .map((_, i) => ctx.fillText("?", 410 + i * 135, yNumero));
            }
          };

          preencheNomeNumero();

          const drawCandidatoImage = () => {
            const candidatoCanvas = document.createElement("canvas");
            const ctxCandidato = candidatoCanvas.getContext("2d");

            candidatoCanvas.height = 800;

            if (!ctxCandidato) {
              return;
            }

            const CIRCLE_WIDTH = 300;

            ctxCandidato.drawImage(candidatoImg, 0, -2, 300, 366);
            ctxCandidato.globalCompositeOperation = "destination-in";
            ctxCandidato.arc(
              CIRCLE_WIDTH / 2,
              CIRCLE_WIDTH / 2,
              CIRCLE_WIDTH / 2,
              0,
              Math.PI * 2
            );
            ctxCandidato.fill();

            ctx.drawImage(candidatoCanvas, 52, yImage);
          };

          drawCandidatoImage();
        }
      );

      await Promise.all(candidatosPromise);

      const output = new Image();
      output.src = canvas.toDataURL();
      const div = document.querySelector("#output");
      output.style.width = "100%";
      div?.appendChild(output);
    };
    drawSantinho();
  }, []);

  return (
    <div class="m-auto">
      <Logo />
      <div>
        <div
          id="output"
          style="width: 300px; height: 533px; background-color: #069; margin-top:20px;"
        ></div>
      </div>
      <img />
      <div class="mt-5 text-center">
        <Button type="submit">Compartilhar</Button>
      </div>
    </div>
  );
}
