import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const githubApi = createApi({
  reducerPath: "githubApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.github.com/" }),
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getUserData: builder.query({
      query: (username) => `users/${username}`,
    }),
    getUserRepos: builder.query({
      query: (username) => `users/${username}/repos?per_page=100`,
    }),
  }),
});

export const { useGetUserDataQuery, useGetUserReposQuery } = githubApi;