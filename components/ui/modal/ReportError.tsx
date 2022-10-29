import { useRef } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "twind";
import { animation, css } from "twind/css";
import Logo from "../../common/Logo.tsx";

// Lazy load a <dialog> polyfill.
// @ts-expect-error HTMLDialogElement is not just a type!
if (IS_BROWSER && window.HTMLDialogElement === "undefined") {
  await import(
    "https://raw.githubusercontent.com/GoogleChrome/dialog-polyfill/5033aac1b74c44f36cde47be3d11f4756f3f8fda/dist/dialog-polyfill.esm.js"
  );
}

declare global {
  interface HTMLDialogElement {
    showModal(): void;
    close(): void;
  }
}

const slideRight = animation("0.4s ease normal", {
  from: { transform: "translateX(100%)" },
  to: { transform: "translateX(0)" },
});

const slideBottom = animation("0.4s ease normal", {
  from: { transform: "translateY(100%)" },
  to: { transform: "translateY(0)" },
});


export default function ReportError() {
  const ref = useRef<HTMLDialogElement | null>(null);

  const onDialogClick = (e: MouseEvent) => {
    if ((e.target as HTMLDialogElement).tagName === "DIALOG") {
      ref.current!.close();
    }
  };

  return (
    <div>
      <button
        onClick={() => ref.current!.showModal()}
        class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-black hover:transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        Reportar erro
      </button>
      <dialog
        ref={ref}
        class={tw`bg-transparent p-0 m-0 pt-[50%] sm:pt-0 sm:ml-auto max-w-full sm:max-w-lg w-full max-h-full h-full ${slideBottom} sm:${slideRight}`}
        onClick={onDialogClick}
      >
        <ModalInner />
      </dialog>
    </div>
  );
}

const ModalInner = () => {
  return (
    <div class="bg-white h-full p-4 text-left">
      <div class="flex items-center ">
        <div>
          <button
            class="p-1"
            onClick={(e) => {
              (e.target as HTMLButtonElement).closest("dialog")!.close();
            }}
          >
            <svg
              class="w-6 h-6 fill-current text-gray-600"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        <div class="flex-1">
          <Logo />
        </div>
      </div>
      <div>
        <div class="mt-10">
          <div>
            <label
              htmlFor="comment"
              className="block text-2xl font-medium text-black"
            >
              Escreva o erro no campo abaixo!
            </label>
            <div className="mt-1">
              <textarea
                rows={8}
                name="comment"
                id="comment"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-500 rounded-md p-2 border-2"
                defaultValue={""}
              />
            </div>
          </div>
        </div>
        <div class="mt-10">
          <button
            onClick={() => {}}
            class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-black hover:transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};
