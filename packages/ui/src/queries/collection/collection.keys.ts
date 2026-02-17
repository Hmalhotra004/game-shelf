export const CollectionQueryKeys = {
  all: ["Collection"] as const,

  getMany: () =>
    [...CollectionQueryKeys.all, "getMany", "currentUser"] as const,

  getById: (id: string) => [
    ...CollectionQueryKeys.all,
    "getById",
    "currentUser",
    id,
  ],

  linkSteamGrid: (name: string) => [
    ...CollectionQueryKeys.all,
    "linkSteamGrid",
    "currentUser",
    name,
  ],
};
