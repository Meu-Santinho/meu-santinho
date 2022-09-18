/** @jsx h */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import { useRef, useState } from "preact/hooks";
import { Dialog, Transition } from "headlessui";

export default function Modal() {
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      {/* @ts-expect-error: erro */}
      <Dialog
        as="div"
        class={tw`fixed z-10 inset-0 overflow-y-auto`}
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        {/* @ts-expect-error: erro */}
        <div
          class={tw`flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0`}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* @ts-expect-error: erro */}
            <Dialog.Overlay
              //@ts-ignore: error
              class={tw`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity`}
            />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            class={tw`hidden sm:inline-block sm:align-middle sm:h-screen`}
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            {/* @ts-expect-error: erro */}
            <div
              class={tw`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}
            >
              <div class={tw`bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div class={tw`sm:flex sm:items-start`}>
                  <div
                    class={tw`mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left`}
                  >
                    <Dialog.Title
                      as="h3"
                      //@ts-ignore : erro
                      class={tw`text-lg leading-6 font-medium text-gray-900`}
                    >
                      Deactivate account
                    </Dialog.Title>
                    <div class={tw`mt-2`}>
                      <input
                        type="text"
                        name="report"
                        id="report"
                        class={tw`shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md`}
                        placeholder="Digite sua reclamação"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                class={tw`bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}
              >
                <button
                  type="button"
                  class={tw`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={() => setOpen(false)}
                >
                  Deactivate
                </button>
                <button
                  type="button"
                  class={tw`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={() => setOpen(false)}
                  ref={cancelButtonRef}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
