import { useEffect, useState } from "preact/hooks";
import { bgDf, bgNormal } from "../utils/bgImages.ts";
import Button from "../components/ui/button/Button.tsx";
import Modal from "../components/ui/modal/Modal.tsx";

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
  uf: string;
  candidatos: Record<Cargos, DadosCandidato>;
}

const loadImage = (fotoUrl: string) => {
  const candImg = new Image();
  candImg.crossOrigin = "anonymous";
  candImg.src = fotoUrl.replace(
    "divulgacandcontas.tse.jus.br/",
    "meu-santinho-proxy.deno.dev/",
  );
  return new Promise<typeof candImg>((res) => {
    candImg.onload = () => {
      res(candImg);
    };
  });
};

export default function GerarSantinho({ candidatos, uf }: Props) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const infosCandidatos = [
    {
      numeroDefault: "????",
      yNome: 175 + 60,
      yNumero: 320 + 65,
      ...candidatos.deputadofederal,
      yImage: 225,
    },
    {
      numeroDefault: "?????",
      yNome: 525 + 50,
      yNumero: 670 + 45,
      ...(candidatos.deputadoestadual || candidatos.deputadodistrital),
      yImage: 556,
    },
    {
      numeroDefault: "???",
      yNome: 865 + 35,
      yNumero: 1015 + 35,
      ...candidatos.senador,
      yImage: 886,
    },
    {
      numeroDefault: "??",
      yNome: 1220 + 40,
      yNumero: 1370 + 40,
      ...candidatos.governador,
      yImage: 1247.5,
    },
    {
      numeroDefault: "??",
      yNome: 1570 + 35,
      yNumero: 1715 + 30,
      ...candidatos.presidente,
      yImage: 1579,
    },
  ];

  useEffect(() => {
    const drawSantinho = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = SANTINHO_WIDTH;
      canvas.height = SANTINHO_HEIGHT;

      const bg = await loadImage(uf === "DF" ? bgDf : bgNormal);

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
          const candidatoImg = fotoUrl ? await loadImage(fotoUrl) : null;

          if (!ctx) {
            return;
          }

          const preencheNomeNumero = () => {
            ctx.fillStyle = nomeUrna ? "#704FCC" : "#666";

            const nomeToDraw = nomeUrna ?? "Não escolhido(a)";
            const fontSizeNome = (() => {
              return `${600 - (nomeToDraw.length / 600)}`;
            })();

            ctx.font = `bold ${fontSizeNome}% 'Source Sans Pro'`;

            ctx.fillText(nomeToDraw, 372, yNome, 600);
            ctx.fillStyle = nomeUrna ? "#000" : "#666";
            ctx.font = `bold 128px 'Source Sans Pro'`;

            const numeroToDraw = numero ? numero.toString() : numeroDefault;

            numeroToDraw
              .toString()
              .split("")
              .forEach((algarismo: string, i: number) => {
                ctx.fillText(algarismo, 390 + i * 110, yNumero);
              });
          };

          preencheNomeNumero();

          const drawCandidatoImage = () => {
            const candidatoCanvas = document.createElement("canvas");
            const ctxCandidato = candidatoCanvas.getContext("2d");

            candidatoCanvas.height = 800;

            if (!ctxCandidato) {
              return;
            }

            const CIRCLE_WIDTH = 212.5;

            candidatoImg &&
              ctxCandidato.drawImage(
                candidatoImg,
                0,
                -2,
                CIRCLE_WIDTH,
                (CIRCLE_WIDTH * 366) / 300,
              );
            ctxCandidato.globalCompositeOperation = "destination-in";
            ctxCandidato.arc(
              CIRCLE_WIDTH / 2,
              CIRCLE_WIDTH / 2,
              CIRCLE_WIDTH / 2,
              0,
              Math.PI * 2,
            );
            ctxCandidato.fill();

            ctx.drawImage(candidatoCanvas, 83, yImage);
          };

          if (candidatoImg) {
            drawCandidatoImage();
          }
        },
      );

      await Promise.all(candidatosPromise);

      const output = new Image();
      output.style.borderRadius = "20px";
      output.style.border = "3px solid #704FCC";

      output.src = canvas.toDataURL();
      setCanvas(canvas);
      const div = document.querySelector("#output");
      output.style.width = "100%";
      div?.appendChild(output);
    };
    drawSantinho();
  }, []);

  const compartilharImagem = () => {
    if (!canvas) {
      return;
    }

    canvas.toBlob(async (blob) => {
      // Even if you want to share just one file you need to
      // send them as an array of files.
      if (!blob) {
        return;
      }
      const files = [new File([blob], "meu-santinho.png", { type: blob.type })];
      const shareData = {
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

  return (
    <div class="m-auto">
      <div class="flex justify-center">
        <div
          id="output"
          style="width: 300px; height: 533px;  margin-top:20px;"
        >
        </div>
      </div>
      <img />
      <div class="mt-5 text-center">
        <div class="flex flex-row justify-center">
          {/* @ts-expect-error */}
          <Button type="submit" onClick={() => compartilharImagem()}>
            Compartilhar
          </Button>
          <a
            href="/"
            class="ml-3 inline-flex items-center px-3 py-2 border border-black shadow-sm text-sm leading-4 font-medium rounded-md text-black bg-transparent hover:bg-gray-400  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Voltar ao Início
          </a>
        </div>
        <div class="flex flex-col items-center mt-3">
          <label for="email" class="block text-sm font-medium text-gray-700">
            Copie o link
          </label>

          <input
            id="url"
            type="text"
            onFocus={(e) => {
              e.currentTarget.select();
            }}
            value={window?.location?.href}
            class="p-2 block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 border rounded-md"
          />
        </div>
        <div class="mt-10">
          <label class="block text-sm font-medium text-gray-700">
            Aconteceu algum erro?
          </label>
          <div class="mt-2">
            <Modal />
          </div>
        </div>
      </div>
    </div>
  );
}
