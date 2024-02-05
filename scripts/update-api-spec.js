const fs = require("fs");
require("dotenv").config({ path: `.env.local` });

async function fetchAPISpec() {
  const res = await fetch(`${process.env["SUPABASE_URL"]}/rest/v1/`, {
    headers: {
      apikey: process.env["SUPABASE_SERVICE_KEY"] ?? "",
      Authorization: `Bearer ${process.env["SUPABASE_SERVICE_KEY"]}`,
    },
  });
  const json = await res.json();
  fs.writeFileSync("data/api-spec.json", JSON.stringify(json, null, 2));
}

fetchAPISpec();
