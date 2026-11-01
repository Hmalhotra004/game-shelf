import { GenericErrorMessage } from "@/constants";
import { getPSNAuthorization } from "@/lib/PsnApiAuth";
import type { Request, Response } from "express";

import {
  PS_VERSION_ORDER,
  buildTrophyGroups,
  fetchEarnedTrophies,
  fetchTitleTrophies,
} from "@/lib/psn/trophies";

export const getTrophies = async (req: Request, res: Response) => {
  try {
    const PSNAccountId = req.user.PSNAccountId;
    const npCommunicationIds = req.collection.npCommunicationIds;

    // Owned versions that actually have a trophy list, newest first.
    const owned = PS_VERSION_ORDER.flatMap((version) => {
      const npCommunicationId = npCommunicationIds[version];
      return npCommunicationId ? [{ version, npCommunicationId }] : [];
    });

    if (owned.length === 0) {
      return res.status(200).json({ versions: [] });
    }

    const authorization = await getPSNAuthorization();

    const versions = await Promise.all(
      owned.map(async ({ version, npCommunicationId }) => {
        // Trophy definitions are public; progress is optional enrichment.
        const [definitions, earned] = await Promise.all([
          fetchTitleTrophies(authorization, npCommunicationId, version),
          PSNAccountId
            ? fetchEarnedTrophies(
                authorization,
                PSNAccountId,
                npCommunicationId,
                version,
              ).catch((err) => {
                // Private profile / game never played: show trophies as locked.
                req.log.warn(
                  { err, version, npCommunicationId },
                  "GET_PSN_EARNED_TROPHIES_UNAVAILABLE",
                );
                return null;
              })
            : null,
        ]);

        return {
          version,
          ...buildTrophyGroups(definitions, earned),
        };
      }),
    );

    return res.status(200).json({ versions });
  } catch (err) {
    req.log.error({ err }, "GET_PSN_TROPHIES_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
