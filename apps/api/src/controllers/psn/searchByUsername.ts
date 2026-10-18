import { GenericErrorMessage } from "@/constants";
import { getPSNAuthorization } from "@/lib/PsnApiAuth";
import { SearchByUsernamePSNSchemaType } from "@repo/schemas/server/schemas/psn";
import type { Request, Response } from "express";
import { makeUniversalSearch } from "psn-api";

export const searchByUsername = async (req: Request, res: Response) => {
  try {
    const { query } = req.cleanQuery as SearchByUsernamePSNSchemaType;

    const authorization = await getPSNAuthorization();

    const response = await makeUniversalSearch(
      authorization,
      query,
      "SocialAllAccounts",
    );

    response.domainResponses[0].results;

    const results = response?.domainResponses?.[0]?.results ?? [];

    const users = results.map(({ socialMetadata: s }) => ({
      accountId: s.accountId,
      onlineId: s.onlineId,
      avatarUrl: s.avatarUrl,
    }));

    return res.status(200).json(users);
  } catch (err) {
    req.log.error({ err }, "SEARCH_USERNAME_PSN_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
