export const ListQueryKeys = {
  all: ["Lists"] as const,

  getMany: () => [...ListQueryKeys.all, "currentUser"] as const,
};
