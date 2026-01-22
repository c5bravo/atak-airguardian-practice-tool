import { NextRequest, NextResponse } from "next/server";
import { storage } from "./lib/storage";
import { ManifestSchema, PeopleListSchema } from "./lib/types";
import * as fs from "node:fs";
import * as https from "node:https";

async function fetchAdmins() {
  const manifest = ManifestSchema.parse(
    JSON.parse(
      fs.readFileSync("/pvarki/kraftwerk-init.json", { encoding: "utf-8" }),
    ),
  );
  return new Promise((resolve, reject) => {
    const req = https.request(
      `${manifest.rasenmaeher.mtls.base_uri}api/v1/people/list/admin`,
      {
        key: fs.readFileSync("/data/persistent/private/mtlsclient.key"),
        cert: fs.readFileSync("/data/persistent/public/mtlsclient.pem"),
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      },
    );
    req.on("error", (e) => {
      reject(e);
    });
    req.end();
  });
}

export default async function proxy(req: NextRequest) {
  const userHeader = req.headers.get("x-clientcert-dn");

  if (!userHeader) {
    return;
  }
  const userName = userHeader.substring(3);
  const existingPeople = await storage.getItem("people");
  if (!existingPeople || Date.now() - existingPeople.time > 1000 * 60) {
    console.log("Fetching admins from RM");
    const resp = await fetchAdmins();
    const data = PeopleListSchema.parse(
      JSON.parse(resp as string),
    ).callsign_list;
    await storage.setItem("people", {
      callsign_list: data,
      time: Date.now(),
    });
  }
  const people = await storage.getItem("people");

  const isAdmin = people?.callsign_list.some(
    ({ callsign }) => callsign === userName,
  );
  if (!isAdmin) {
    return Response.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  return NextResponse.next();
}
