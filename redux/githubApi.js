import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const githubApi = createApi({
  reducerPath: 'githubApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.github.com/' }),
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (username) => `users/${username}`,
    }),
    getRepos: builder.query({
      query: (username) => `users/${username}/repos`,
    }),
  }),
});

export const { useGetUserQuery, useGetReposQuery } = githubApi;