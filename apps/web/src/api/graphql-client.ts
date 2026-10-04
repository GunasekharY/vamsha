const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql';

export class GraphQLError extends Error {}

export async function graphqlRequest<TResult, TVariables extends object = Record<string, never>>(
  query: string,
  variables?: TVariables,
  accessToken?: string,
): Promise<TResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const body = await response.json();

  if (body.errors?.length) {
    throw new GraphQLError(body.errors[0]?.message ?? 'GraphQL request failed.');
  }

  return body.data as TResult;
}
