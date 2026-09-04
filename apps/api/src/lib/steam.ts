//cdn.cloudflare.steamstatic.com/steam/apps/{APP_ID}/
// | Use case         | URL                    |
// | ---------------- | ---------------------- |
// | Header (wide)    | `/header.jpg`          |
// | Capsule (grid)   | `/capsule_231x87.jpg`  |
// | Capsule (square) | `/capsule_184x69.jpg`  |
// | Library grid     | `/library_600x900.jpg` |t
// | Library hero     | `/library_hero.jpg`    |t
// | Library logo     | `/logo.png`            |

import axios from "axios";

export enum SteamImageSizeType {
  "Header" = "header",
  "Capsulegrid" = "capsule_231x87",
  "Capsulesquare" = "capsule_184x69",
  "grid" = "library_600x900",
  "hero" = "library_hero",
}

export async function exists(url: string): Promise<boolean> {
  try {
    const res = await axios.get(url, {
      timeout: 5000,
      responseType: "stream",
      validateStatus: () => true,
    });

    return res.status === 200;
  } catch {
    return false;
  }
}

export async function resolveSteamImage(
  appid: number,
  size: SteamImageSizeType,
): Promise<string | null> {
  const image = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/${size}.jpg`;

  const hasImage = await exists(image);

  return hasImage ? image : null;
}
