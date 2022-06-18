import Fastify, { FastifyInstance, RouteShorthandOptions } from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";

export async function startFileServer(port: number) {
  const server: FastifyInstance = Fastify({});
  const root = path.resolve("./");
  console.log("serving files from:", root);
  server.register(fastifyStatic, {
    root: root,
    prefix: "/",
    index: false,
    list: {
      format: "html",
      render: (dirs, files) => {
        return `
          <html>
            <body>
              <ul>
                ${dirs
                  .map(
                    (dir) => `<li><a href="${dir.href}">${dir.name}</a></li>`
                  )
                  .join("\n  ")}
              </ul>
              <ul>
                ${files
                  .map((file) => {
                    const extension = path.extname(file.name);
                    if (extension === ".flac") {
                      return `
                        <h2>${file.name}</h2>
                        <audio controls>
                          <source src="${file.href}" type="audio/flac" />
                          Your browser does not support the audio tag (flac).
                        </audio>
                      `;
                    }
                    return `<li><a href="${file.href}" target="_blank">${file.name}</a></li>`;
                  })
                  .join("\n  ")}
              </ul>
            </body>
          </html>
        `;
      },
    },
  });

  try {
    console.log("will listen", port);
    await server.listen({ port });
    console.log("listening http://localhost:" + port);
  } catch (err) {
    server.log.error(err);
  }
}
