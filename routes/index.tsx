/** @jsx h */
import { h } from "preact";
import { Handlers } from "$fresh/server.ts";
import Home from "../islands/Home.tsx";

interface APIData {
  country: string;
  city: string;
  timezone: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const ip = (ctx.remoteAddr as Deno.NetAddr).hostname;
    const res = await fetch("http://ip-api.com/json/" + ip);
    const data: APIData = await res.json();
    console.log({ data})
    return ctx.render({ data });
  },
};
export default function Index() {
  return <Home />;
}
