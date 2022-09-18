/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";

export default function ReportButton(props: { children: string; type: string }) {
  return (
    <button
      class={tw`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-500 hover:transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
      {...props}
    />
  );
}
