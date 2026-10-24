import { ReleaseInfo } from "@repo/schemas/types/index";
import { REPO } from "@repo/utils/constants";
import { queryOptions } from "@tanstack/react-query";
import axios, { AxiosInstance } from "axios";

export const AppQueryKeys = {
  all: ["App"] as const,

  getMobileVersion: () => [...AppQueryKeys.all, "getMobileVersion"],

  getGithubRelease: () => [...AppQueryKeys.all, "getGithubRelease"],
};

export const getMobileVersionQueryOptions = (api: AxiosInstance) =>
  queryOptions({
    queryKey: AppQueryKeys.getMobileVersion(),
    queryFn: async () => {
      const response = await api.get(`/mobile/getVersion`);

      return response.data;
    },
  });

export const getLatestReleaseQueryOptions = (enabled: boolean) =>
  queryOptions({
    queryKey: AppQueryKeys.getGithubRelease(),
    queryFn: async (): Promise<ReleaseInfo | null> => {
      const response = await axios.get(
        `https://api.github.com/repos/${REPO}/releases?per_page=10`,
      );

      if (response.status !== 200) throw new Error(`GitHub ${response.status}`);

      const releases = await response.data;
      const rel = releases.find((r: any) => !r.draft); // newest first
      const apk = rel?.assets?.find((a: any) => a.name.endsWith(".apk"));
      if (!rel || !apk) return null;

      return {
        version: String(rel.tag_name).replace(/^v/, ""),
        notes: rel.body ?? "",
        apkUrl: apk.browser_download_url,
        pageUrl: rel.html_url,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
