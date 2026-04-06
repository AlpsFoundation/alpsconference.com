#!/usr/bin/env node
/**
 * Downloads partner logos from Google Sites CDN and saves them locally.
 * Updates src/components/Partners.tsx to use local paths.
 *
 * Usage: bun run scripts/download-logos.mjs
 */

import { mkdir, writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(ROOT, "public", "img", "partners");

const PARTNERS = {
  "Academic Partners": [
    "https://lh3.googleusercontent.com/sitesv/APaQ0STa7uJVqXJd8ozCKnjA21S5pvSmhvHI-y2upbh4GFarIa3ebIrlv5jVBULP9bCWCkfLBOiAnSYMZlFShwGN9jKpiVJjqQ_mfMu4dbGCMw4g_fCPvFfjGYHrjPjq2cpO0r6oeCocyYIR-WYe980Bi90xaiQc58XHwwv-4ZrBg-0UNddP3uFllIBvy8Y=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQlCnMeUykYHqiJCqjszrDVUagXMaLdWCMBAOsRW4ukywixbyd8sqCzVvifW0PtQkMuCaFepXzIfX2hSXBpmwb95L0BWxOnzW8diWD8zyHihLGD5io0NKnimDY3DbqlR2w05XI13Y5WIDRFHUk-mDfLmjYFp1Tlz4_Z0Cg1d4vvQi2N8jxa7bkM=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0STyfPiYo4Kw2xIKjeZW5bbKsTLid8Yprv5BT8ff7KJjOBc2dFKv4MBtlMeKzPhFrpQyTcSKqTEkKvnKPn9YgYH5xD62ykZgsCWm_ync5KJZk43vnSfc8HEJn66EswoHQq8nx-J_t_1iXHoWEyhrI0BFLW_GnFup21JppW4vGyoVZ9tge4axBecbIqk=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SSG_FUMXj5jsUaE3eaXNF3zbW18Q-AK6l-K-8-vsA7ZjUpE0U7ZMgb72G90qlVE6-SwY8-upL90T4jnaw-FcQBxFo-qlhDDzFMBTWfGN9iDxR8LuEcAEpWqXjPdlOCNauRWx-WL59g1x8Ie3AFOlPFJQiZ6wCGc2y8OSdMDOaUPMlel2dyJbw=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQau9moEIRvMZzzDWL4EKBUjp6jhCeoS5w5e-SbObj6XtUZK3023K3f7R3Wpu4-FDjxroYD9Urn-GatP_8fYoAtwZuuyQXRI-YhcBajT_Vyw01LAgQcgBzV38AA_ckoyxjaPf5nwZTDipzq9QjtpR2zgrHNeS-9uvfDM8D8hLGzJYWHM_gHut5Y=w1280",
  ],
  "Swiss Professional Associations": [
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQSrzJ0srEmvX0w1a-6GDxZKbF3bFm7BDcVR4lMW9L07FCyoOa6vOJeAZPZ1VbRZchS3ImpZhYwRVHdS5kyXF2C17DijZNS4_mALME3qMDS6aqdZPnjaMK0BXOTImdxolnpZ7PYFAWDRalgPvNw-hZAFSwQugVseIEv357-N-OqPj7MULocz1jyOPk=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQw7DBIEYXv9mJfHXuukjHAuPgttcmF3Hg6HPNvBIIkgXATG1T5JdvWzEjlHEmCvdoPwOPrVSa_23D1w0_V4IFHlobdIa8w_ensH1FTEloq_7Im-miLZ-krzZe4TPnLDAWXwg5jNNWN9IlrrpUq-wcUBQBplBriXq_Aoig4iiNIp_-DjfFARMeD8fw=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SSYQQGsqmxPzRO5Fcpa1ZMBVpdCcVlje8gh2qVKEu2T6-onN0nu0VBZv4LilAzKvYppAZ-m20jDbrwOPQs9HW8cKHY9Un5yxg2LTTNP1XMSRmPv9fehf4KrBusfbkqeTKKb6tYrsFAr22FzUTo9uUeEmMojO4tukO_peCYrkeTzy1lRGflotg5G4CI=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQV_QOIV1lqyQAZ1vPnmrO0fVSbm-CGm8Uj9AVntskOoZs2DOPGk-DqiNyn78TbRwDgCsPFUGYoK7zLM91bKFW5ZBTw2skPy2Ji9yVDuKi-KXJT8CseYNwBRsw6BcMP859W-Fp9l1oF5qoNj6qNmtQCgxhE1HTwNPYuRT-ArLrE5yHkBuK6nKRIXTA=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0STnuyy14Mph7ttyK9__LgrVGw3P_0w5CAKp0KruYphRTkq7DtnCT6kwSFyg5cmRQbXI8my7k3nWSDumPsQpMoEM-FX7THwM3vYxQf9JaOVZyMdmmpgjBNqIgCbxG4TXPlrvHddNwK1N4gHyR7b0Y8uYtsuiiBW9Z23eljNBgSC8BaXjApcr16qPQUHZwhafsgnq1TecvtBVeylhTzqLucryDl_eHW8Y8PwBRRM=w1280",
  ],
  "Media Partners": [
    "https://lh3.googleusercontent.com/sitesv/APaQ0STBtGeQSj7oc-CniJvJ_s66uaTDv7QhRBC6jS18Sd_2JuwXh-f4_pXoCsvpxxxqmsMB2PkBM2ntZq_-5oqUFTKKTT_QNxByty41AiLn-H8bSuEXPRu-_QxcV02VCC5erqyKQV0MDbYBPOGliMBH-sWVmEZ0x_8T5P80gtAXrjkbRMnzVLDI80y3U7Y=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0STX5GOsPYeXecxnYw5BSBYm2eTbjQIGggbclyim0Da9BO7F9NGRG-Ovr_llFagry-rz84079A1J2wySkbL6wjMlUg-dFmwU2kXwqMccp6xcc4aOhupvN4QF1pZm4Y3ESChfz0PFsRw9rTC3HQk45U4Zl6otRb3xpjWfgoVLKo2oggryW_vYKA=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SSclbJ7ENa2JC9e6lZDrNWs6TfhBB2h5K74BYb7HGdAql5qWbS8xuoduKjTDG0SVogxtJRITjgamHiRm380aSZcPnHFaJ3IqPwjS6RmfLs0lpe1Ssw5kZqSYWWawyAv1ne06uQNEpT2GAGiiKTfkcLBGwnD6esB0fj22YruxRKwVEpcR2SpIdFXfPQ=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0STPzFZNIfgrc8hGxfQTwFQFF6YCVAvn3BZvFWvy5hpGc2e4AWRpnhvfvK3K7cOs17m75xgv4JK0m-goc38G-fvhcriIH65a8_eef913UFRstHCTKsodjUTKtZrxyWVTrfbOQeNDEBaqVaU7TZhxaGCw6sac4RhZnk9Pn0jUFTE4U2Bd0Vi0zUfuUO4=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQ5U1l6DVN8WrRjznXUAubIO-kY1RQ0MhmCYVMPcqY6ZQYeGGQcCVhPsXdxHMTkK73D-vNPJ7jyhgGCeqQrVnSk1URgOSi9KTyqRP9XRF2loYXmCpvZ3ogMkDa7xgYY27TDOn_9czHqCGJHPVn3Pssl2gAA6Q6SMdwN8peE3RH4FzgNArMla9HkPj0=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SRD3GNLJQvjD303cwN6EkamkTHCEDR04B5R8Qd7mniyEojE27wZtAHLCY8uK4Lc5cvS5mYbA6_aqc96ZsL3IDZeIe4OpEPAr2v5LsofAXh4w-QtnBD__vPkKvCWMKdvXYeXLJqjYlBthChXBuYvQtlDvb-RVUHtHWCEhkjVaY2gf6O4GsEFHrSggHA=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQFAfTVIRar-vc6IhLbWyC4IlHHLyONBTtHGUNBmU3Rh7HggrO70xAv_dWXpZMYzbL9374SiEbBhuZpzi7WrzXGRd5Kkni2-vDUhaAA3yEC8EiCtZ-GzeXiKI83V4uHKqqzzdpHFY05i82wi8eTO5ZasdkV4SYrUCNtm0kDX0euxIOpBTWxCTlF2v0=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SR3NcnHjZe6tM3zKfGZUznXmiKd4KSqn8-DoTbRa5HemHkJ_pMPVa5qW2GY_Dqs0nUHWO3PI5Srd4Pw2CkfsZCVITMl-4pKuPag5EcNuvBLVUDdEYmMX_VGxm5fC1r5hNcI9MCDn7IXjgdE5_y5gqLJ65FZC5xV3t6PCAUejb6U-rYWGeH1uaPq=w1280",
  ],
};

const CATEGORY_SLUGS = {
  "Academic Partners": "academic",
  "Swiss Professional Associations": "associations",
  "Media Partners": "media",
};

async function detectExtension(buffer) {
  // Check magic bytes
  const bytes = new Uint8Array(buffer.slice(0, 8));
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "gif";
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return "webp";
  // SVG check
  const text = Buffer.from(bytes).toString("ascii");
  if (text.includes("<sv") || text.includes("<?x")) return "svg";
  return "png"; // fallback
}

async function downloadLogo(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = await res.arrayBuffer();

  // Check content-type for SVG
  const contentType = res.headers.get("content-type") || "";
  let ext;
  if (contentType.includes("svg")) {
    ext = "svg";
  } else {
    ext = await detectExtension(buffer);
  }

  const finalPath = `${filePath}.${ext}`;
  await writeFile(finalPath, Buffer.from(buffer));
  return { finalPath, ext };
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Map of original URL -> local public path (e.g. /img/partners/academic-01.png)
  const urlToLocal = {};

  for (const [category, urls] of Object.entries(PARTNERS)) {
    const slug = CATEGORY_SLUGS[category];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const index = String(i + 1).padStart(2, "0");
      const baseName = `${slug}-${index}`;
      const basePath = join(OUTPUT_DIR, baseName);

      process.stdout.write(`Downloading ${category} #${index}... `);
      try {
        const { finalPath, ext } = await downloadLogo(url, basePath);
        const publicPath = `/img/partners/${baseName}.${ext}`;
        urlToLocal[url] = publicPath;
        console.log(`saved as ${publicPath}`);
      } catch (err) {
        console.error(`FAILED: ${err.message}`);
        urlToLocal[url] = url; // keep original on failure
      }
    }
  }

  // Rewrite Partners.tsx
  const tsxPath = join(ROOT, "src", "components", "Partners.tsx");
  let src = await readFile(tsxPath, "utf8");

  for (const [original, local] of Object.entries(urlToLocal)) {
    // Escape special regex chars in URL
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    src = src.replace(new RegExp(escaped, "g"), local);
  }

  await writeFile(tsxPath, src, "utf8");
  console.log("\nPartners.tsx updated with local paths.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
