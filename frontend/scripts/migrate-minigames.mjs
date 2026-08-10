import fs from "fs";

const files = ["src/data/experienceMinigames.ts", "src/data/challenges.ts"];
const map = {
  "/demo-assets/viral-health-alert.svg": "viral-health-alert",
  "/demo-assets/photos/flood-lagos-2019.jpg": "flood-lagos-2019",
  "/demo-assets/photos/flood-response-2015.jpg": "flood-response-2015",
  "/demo-assets/photos/wildfire-washington-dc.jpg": "wildfire-washington-dc",
  "/demo-assets/photos/vaccine-vial-2024.jpg": "vaccine-vial-2024",
  "/demo-assets/photos/protest-2024.jpg": "protest-2024",
  "/demo-assets/photos/covid-protest-2020.jpg": "covid-protest-2020",
  "/demo-assets/synthetic-portrait-scene.svg": "synthetic-portrait-scene",
  "/demo-assets/archived-flood-photo.svg": "archived-flood-photo",
  "/demo-assets/reused-flood-photo.svg": "reused-flood-photo",
};

for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  for (const [path, id] of Object.entries(map)) {
    s = s.split(`imageSrc: "${path}"`).join(`mediaAssetId: "${id}"`);
    s = s.split(`thumbSrc: "${path}"`).join(`mediaAssetId: "${id}"`);
  }
  fs.writeFileSync(file, s);
  console.log(file, (s.match(/mediaAssetId:/g) || []).length);
}
