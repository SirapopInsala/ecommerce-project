const fetchGraphQL = async (query: string, variables: Record<string, unknown> = {}) => {
  const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_SECRET as string,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    console.error('HTTP error!', response.status, response.statusText);
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
  }

  return result.data;
};

export default fetchGraphQL;
