// Crops the /countdown photos from the ALPS Media Library to 2160 × 2700
// (4:5 at 2×) around a focus point and writes them to public/img/countdown/.
// Needs ImageMagick and the ALPS Shared drive synced locally:
//
//   PHOTOS_DIR=".../ALPS Shared/70_Media Library/73_Photos" node scripts/countdown/photos.mjs [slug ...]
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const LIB = process.env.PHOTOS_DIR;
if (!LIB) throw new Error("Set PHOTOS_DIR to the Media Library's 73_Photos folder.");
const OUT = fileURLToPath(new URL("../../public/img/countdown", import.meta.url));
const W = 2160;
const H = 2700;

// [slug, source under 73_Photos, focusX, focusY, zoom]
const PHOTOS = [
  ["hall-audience", "ALPS Conf 2024/Aurelio/Venue/IMG_5094.JPG", 0.5, 0.5, 1],
  ["talk-stage", "ALPS Conf 2025/CONF25_SM_selection/_65A2029.jpg", 0.62, 0.5, 1],
  ["audience-applause", "ALPS Conf 2025/CONF25_SM_selection/ALPSCon25-ML-224.jpg", 0.45, 0.5, 1],
  ["crowd-above", "ALPS Conf 2025/CONF25_SM_selection/ALPSCon25-ML-116.jpg", 0.5, 0.5, 1],
  ["audience-back", "ALPS Conf 2025/CONF25_SM_selection/_65A2037-Pano.jpg", 0.5, 0.5, 1],
  ["panel-stage", "ALPS Conf 2025/CONF25_SM_selection/ALPSCon25-ML-281.jpg", 0.45, 0.5, 1],
  ["audience-question", "ALPS Conf 2025/CONF25_SM_selection/_65A2677.jpg", 0.45, 0.5, 1],
  ["listening", "ALPS Conf 2025/CONF25_SM_selection/_65A1583.jpg", 0.45, 0.5, 1],
  ["poster-discussion", "ALPS Conf 2024/Janick/Posters/DSC_3896.jpg", 0.42, 0.5, 1],
  ["sound-meditation", "ALPS Conf 2025/CONF25_SM_selection/_65A2075.jpg", 0.5, 0.5, 1],
  ["sound-bath", "ALPS Conf 2025/CONF25_SM_selection/ALPSCon25-ML-159.jpg", 0.5, 0.5, 1],
  ["handpan", "ALPS Conf 2025/CONF25_SM_selection/_65A3613.jpg", 0.5, 0.5, 1],
  ["live-painting", "ALPS Conf 2024/Janick/Artworks/DSC_4134.jpg", 0.4, 0.5, 1],
  ["circle", "ALPS Conf 2025/CONF25_SM_selection/_65A1640-Pano.jpg", 0.5, 0.5, 1],
  ["table-talk", "ALPS Conf 2025/CONF25_SM_selection/_65A3782.jpg", 0.5, 0.5, 1],
  ["conversation", "ALPS Conf 2024/Marcy/Vibes/DSC08077.JPG", 0.5, 0.45, 1],
  ["kuk-entrance", "ALPS Conf 2024/Aurelio/Venue/IMG_4761.JPG", 0.5, 0.5, 1],
  ["badges", "ALPS Conf 2024/Janick/Venue, Team, Participants/DSC_3846.jpg", 0.5, 0.5, 1],
  ["lunch-service", "ALPS Conf 2025/CONF25_SM_selection/_65A2308.jpg", 0.6, 0.5, 1],
  ["hall-stage", "ALPS Conf 2024/Aurelio/Venue/IMG_5554.JPG", 0.5, 0.5, 1],
  ["good-company", "ALPS Conf 2025/CONF25_SM_selection/ALPSCon25-ML-209.jpg", 0.5, 0.5, 1],
  ["evening-drinks", "ALPS Conf 2025/Socials/ALPSCon25-ML-148.jpg", 0.5, 0.5, 1],
  ["afterparty", "ALPS Conf 2025/Afterglow/ALPSCon25-ML-307.jpg", 0.5, 0.5, 1],
  ["see-you-in-aarau", "ALPS Conf 2025/CONF25_SM_selection/ALPSCon25-ML-295.jpg", 0.5, 0, 1],
];

const only = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });

for (const [slug, src, fx, fy, zoom] of PHOTOS) {
  if (only.length && !only.includes(slug)) continue;
  const path = `${LIB}/${src}`;
  // Dimensions after EXIF orientation.
  const [iw, ih] = execFileSync("magick", [path, "-auto-orient", "-format", "%w %h", "info:"]).toString().trim().split(" ").map(Number);
  const scale = Math.max(W / iw, H / ih) * zoom;
  const rw = Math.round(iw * scale);
  const rh = Math.round(ih * scale);
  const x = Math.round(Math.min(Math.max(rw * fx - W / 2, 0), rw - W));
  const y = Math.round(Math.min(Math.max(rh * fy - H / 2, 0), rh - H));
  execFileSync("magick", [
    path, "-auto-orient", "-colorspace", "sRGB", "-resize", `${rw}x${rh}!`,
    "-crop", `${W}x${H}+${x}+${y}`, "+repage", "-strip", "-interlace", "Plane",
    "-sampling-factor", "4:2:0", "-quality", "78", `${OUT}/${slug}.jpg`,
  ]);
  console.log(`${slug}: ${iw}x${ih} -> crop +${x}+${y}`);
}
