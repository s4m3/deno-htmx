import renderToString from "preact-render-to-string";
import Home from "./Home.jsx";

const PORT = 1234;

let counter = 0;

type RequestHandler = (
  request: Request,
  params: Record<string, string>,
) => Promise<Response>;

enum Method {
  GET = "GET",
  PUT = "PUT",
  POST = "POST",
  DELETE = "DELETE",
}
const routes = {
  [Method.GET]: [],
  [Method.PUT]: [],
  [Method.POST]: [],
  [Method.DELETE]: [],
};

const addRoute = (
  method: Method,
  pathname: string,
  handler: RequestHandler,
) => {
  routes[method].push({ pattern: new URLPattern({ pathname }), handler });
};

const render = (Comp, ...args) => renderToString(Comp(...args));

const route = async (request: Request) => {
  for (const r of routes[request.method]) {
    if (r.pattern.test(request.url)) {
      const params = r.pattern.exec(request.url).groups;
      return await r.handler(request, params);
    }
  }
  return new Response(null, { status: 404 });
};

const handleHome = async () => {
  const body = new TextEncoder().encode(`
<script src="https://unpkg.com/htmx.org@1.9.10" integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC" crossorigin="anonymous"></script>
${render(Home, { test: "test" })}
`);
  return new Response(body);
};

addRoute(Method.GET, "/", handleHome);
addRoute(
  Method.GET,
  "/counter",
  async () => new Response(`<div>${counter}</div>`),
);
addRoute(Method.POST, "/increase", async () => new Response(`${++counter}`));
addRoute(Method.POST, "/click", async () => new Response("<div>change</div>"));

Deno.serve({ port: PORT }, route);
