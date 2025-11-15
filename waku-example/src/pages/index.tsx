import GitHubDemo from "../components/GitHubDemo";

export default async function HomePage() {
  return <GitHubDemo />;
}

export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
