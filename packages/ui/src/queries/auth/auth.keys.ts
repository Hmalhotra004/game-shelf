export const AuthQueryKeys = {
  all: ["auth"] as const,

  checkEmail: () =>
    [...AuthQueryKeys.all, "checkEmail", "currentUser"] as const,
};
