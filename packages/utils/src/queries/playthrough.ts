export const PlaythroughQueryKeys = {
  all: ["Playthrough"] as const,

  getManyAll: () => ["Playthrough", "getMany"] as const,

  getMany: (filters = {}) => ["Playthrough", "getMany", filters] as const,
};

// const DEFAULT_LIMIT = 20;
// export const collectionGetManyQueryOptions = (
//   api: AxiosInstance,
//   filters: CollectionGetManyFilters = {},
// ) =>
//   infiniteQueryOptions({
//     queryKey: PlaythroughQueryKeys.getMany(filters),

//     queryFn: async ({ pageParam, signal }) => {
//       const { limit = DEFAULT_LIMIT, ...rest } = filters;

//       const response = await api.query<CollectionGetManyResponse>(
//         `/collection`,
//         { ...rest, page: pageParam, limit },
//         { signal },
//       );

//       return response.data;
//     },

//     initialPageParam: 1,
//     getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
//   });
