import { ReleaseInfo } from "@repo/schemas/types/index";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";

export async function downloadAndInstall(
  info: ReleaseInfo,
  onProgress: (pct: number) => void,
) {
  const dest = FileSystem.cacheDirectory + `update-${info.version}.apk`;
  const dl = FileSystem.createDownloadResumable(info.apkUrl, dest, {}, (p) =>
    onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite),
  );
  const result = await dl.downloadAsync();
  if (!result) throw new Error("Download failed");

  const contentUri = await FileSystem.getContentUriAsync(result.uri);
  await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
    data: contentUri,
    flags: 1,
    type: "application/vnd.android.package-archive",
  });
}
