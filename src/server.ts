import net from "net";
import { pipeline } from "stream";
import bind from "bind-easy";
import { assert } from "./assert";
import { startFileServer } from "./start-file-server";
import DHT from "@hyperswarm/dht";

const node = new DHT();
const key = process.argv[2] && Buffer.from(process.argv[2], "hex");

main();
async function main() {
  if (key) {
    console.log("Client mode --> Connecting");
    startClientMode();
  } else {
    // Host server mode
    console.log("Server mode --> Hosting");
    // startServer();
    await startFileServer(3000);
  }
}

function startClientMode() {
  // Connecting to `key`
  assert(key.length === 32, `provided key is not 32 chars (is ${key.length})`);

  bind.tcp(8080).then(function (server) {
    server.on("connection", function (socket) {
      console.log("got connection!");
      pipeline(socket, node.connect(key), socket, (err) => {
        if (err) {
          console.error("connection failed", err);

          return;
        }
        console.log("all good!");
      });
    });
    console.log("Client mode. hyperswarm-http-server available on:");
    console.log("  http://127.0.0.1:" + server.address().port);
  });
}

async function startServer() {
  const port = await freePort();

  const server = node.createServer(function (socket) {
    pipeline(socket, net.connect(port, "localhost"), socket, (err) => {
      if (err) {
        console.error("connection failed", err);

        return;
      }
      console.log("all good!");
    });
  });

  server.listen().then(async function () {
    console.log("Server mode. To connect run this http-server on any computer");
    console.log("  npm run dev " + server.address().publicKey.toString("hex"));
    console.log();
    console.log("Output from http-server:");
    console.log();

    //create a server object

    await startFileServer(port);
  });
}

function freePort() {
  return new Promise<number>((resolve) => {
    const server = net.createServer();
    server.listen(0);
    server.on("listening", function () {
      //@ts-expect-error
      const { port } = server.address();
      server.close();
      server.on("close", function () {
        resolve(port);
      });
    });
  });
}

process.once("SIGINT", function () {
  node.destroy().then(function () {
    process.exit();
  });
});
