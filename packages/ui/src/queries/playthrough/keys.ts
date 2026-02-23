export const keys = {
  all: ["Playthroughs"] as const,

  getMany: () => [...keys.all, "getMany", "currentUser"] as const,
};
