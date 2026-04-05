export const playthroughKeys = {
  all: ["Playthroughs"] as const,

  getMany: () => [...playthroughKeys.all, "getMany", "currentUser"] as const,
};
