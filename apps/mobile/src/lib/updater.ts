import { ReleaseInfo } from "@repo/schemas/types/index";
import { compareVersions, validate } from "compare-versions";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";

export const getCurrentAppVersion = () =>
  Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? null;

export const isNewerVersion = (target?: string, current?: string | null) => {
  if (!target || !current) return false;
  if (!validate(target) || !validate(current)) return false;
  return compareVersions(target, current) > 0;
};

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
