import { Handlers } from "$fresh/server.ts";
import Home from "../islands/Home.tsx";

interface APIData {
  country: string;
  city: string;
  timezone: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    // TODO: Later
    const ip = (ctx.remoteAddr as Deno.NetAddr).hostname;
    const res = await fetch("http://ip-api.com/json/" + ip);
    const data: APIData = await res.json();

    return ctx.render({ data });
  },
};
export default function Index() {
  return <Home />;
}
