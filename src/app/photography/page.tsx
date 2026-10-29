import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Photo } from "@/content/misc";
import { PhotoGallery } from "@/components/PhotoGallery";

export const metadata = { title: "Photography — Tan Luc" };

const PHOTO_DIRECTORY = path.join(process.cwd(), "public/images/photo");
const IMAGE_FILE = /\.(avif|gif|jpe?g|png|webp)$/i;

const CAPTIONS: Record<string, string> = {
  "0B7B4AE2": "Sunset waves on the beach",
  "4635DB8F": "Pendant lights inside a spiral staircase",
  "4A1F1C4F": "A collection of ceramic cups",
  "548989BF": "Church spire against a pink sunset",
  "67B03738": "Fresh food at a street market",
  "68FC1214": "Books on a quiet cafe shelf",
  "69814A09": "Sunset reflections across the lake",
  "6D5FA434": "A reading desk and a warm lamp",
  "7297016A": "A church beneath the evening sky",
  "767995F3": "Christmas lights and a nativity scene",
  "828DDE08": "Flags and green plants outside a cafe",
  "8A37A8A0": "A view across a hillside city",
  "90909828": "A wooden bookshelf in a quiet cafe",
  "92065C7B": "Framed art in a narrow red hallway",
  "94574518": "Golden arches inside a church",
  "97623845": "A Christmas nativity display",
  "9CEA8E25": "Orange sunset above the city skyline",
  "A4753550": "Clouds above a historic courtyard",
  "A5AD6B49": "Warm evening light inside a cafe",
  "B9EDF2AA": "Books and pictures on a red cafe wall",
  "C37C508E": "A curved city building beneath gray clouds",
  "D1206F12": "A little white dog at home",
  "D820E315": "Christmas ornaments on a cafe tree",
  "D9FD3831": "Pendant lights above wooden cafe tables",
  "ED31428C": "A glass of matcha in a quiet cafe",
  "F4C13F77": "Pink blossoms against a blue sky",
  "FF379599": "Blue twilight over the ocean",
  "FFFF6E89": "A Christmas tree beside a white chair",
  building: "Evening clouds above a city building",
  church: "Churches and architectural details",
  "in-forest": "Looking up through a green forest canopy",
  japan: "Totoro sheltering under an umbrella",
  "lem-store": "A wall of photographic memories",
  "phan-thiet-seashore": "A rustic wooden cafe surrounded by plants",
  sakura: "Pink cherry blossoms among spring leaves",
  shoe: "Sneakers on a walk through fallen leaves",
  "sunset-xuan-huong-lake": "Sunset reflections on Xuan Huong Lake",
  sunset: "The setting sun beside a quiet street",
};

function toTitle(filename: string) {
  return filename
    .replace(IMAGE_FILE, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function getPhotos(): Promise<Photo[]> {
  const entries = await readdir(PHOTO_DIRECTORY, { withFileTypes: true });
  const basePath = process.env.GITHUB_PAGES === "true" ? "/tanluc" : "";
  const files = await Promise.all(entries
    .filter((entry) => entry.isFile() && /\.webp$/i.test(entry.name))
    .map(async (entry) => ({ name: entry.name, size: (await stat(path.join(PHOTO_DIRECTORY, entry.name))).size })));

  return Promise.all(files
    .sort((a, b) => a.size - b.size || a.name.localeCompare(b.name))
    .map(async (entry) => {
      const title = CAPTIONS[entry.name.replace(IMAGE_FILE, "")] ?? CAPTIONS[entry.name.split("-")[0]] ?? toTitle(entry.name);
      const image = sharp(path.join(PHOTO_DIRECTORY, entry.name));
      const [metadata, [r, g, b]] = await Promise.all([image.metadata(), image.clone().resize(1, 1).removeAlpha().toColourspace("srgb").raw().toBuffer()]);
      const rotated = (metadata.orientation ?? 0) >= 5;
      const style = /church|building|staircase|courtyard|hallway|architectur/i.test(title) ? "Architecture"
        : /sunset|sky|forest|blossom|ocean|lake|beach|leaves/i.test(title) ? "Nature" : "Everyday life";

      return {
        title,
        place: "Photography",
        src: `${basePath}/images/photo/${encodeURIComponent(entry.name)}`,
        tags: [style, entry.name, /sunset|setting sun|evening sky/i.test(title) ? "sunsets hoang hon" : "", /city|street|building/i.test(title) ? "city urban" : "", /cafe|matcha/i.test(title) ? "coffee cafe ca phe" : ""],
        width: (rotated ? metadata.height : metadata.width) ?? 1,
        height: (rotated ? metadata.width : metadata.height) ?? 1,
        color: (Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) + Math.PI * 2) % (Math.PI * 2),
        style,
      };
    }));
}

export default async function Photography() {
  const photos = await getPhotos();

  return (
    <div className="photography-page">
      <PhotoGallery photos={photos} />
    </div>
  );
}
