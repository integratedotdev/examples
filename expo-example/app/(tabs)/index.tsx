import { Image } from 'expo-image';
import { StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { HelloWave } from '@/components/hello-wave';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { client } from '@/lib/integrate';

// Required for expo-web-browser
WebBrowser.maybeCompleteAuthSession();

interface Repo {
  name?: string;
  full_name?: string;
  description?: string;
  html_url?: string;
}

export default function HomeScreen() {
  const [githubAuthorized, setGithubAuthorized] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);

  async function updateButtonStates() {
    try {
      const authorized = await client.isAuthorized('github');
      setGithubAuthorized(authorized);
    } catch (error) {
      console.error('Error checking authorization:', error);
    }
  }

  async function handleGithubClick() {
    try {
      if (githubAuthorized) {
        await client.disconnectProvider('github');
      } else {
        await client.authorize('github');
      }
    } catch (error) {
      console.error('Error in handleGithubClick:', error);
    }
  }

  async function handleListRepos() {
    setLoadingRepos(true);
    setReposError(null);
    setRepos([]);

    try {
      const response = await client.github.listOwnRepos();

      // Extract repos from MCPToolCallResponse
      let extractedRepos: Repo[] = [];

      if (
        response.structuredContent &&
        Array.isArray(response.structuredContent)
      ) {
        extractedRepos = response.structuredContent as Repo[];
      } else if (response.content && response.content.length > 0) {
        // Try to parse JSON from text content
        const textContent = response.content[0]?.text;
        if (textContent) {
          try {
            const parsed = JSON.parse(textContent);
            extractedRepos = Array.isArray(parsed)
              ? parsed
              : parsed.repos || parsed.repositories || [];
          } catch {
            extractedRepos = [];
          }
        }
      }

      // Filter and validate repos to ensure they're objects
      const validRepos = extractedRepos.filter(repo =>
        repo && typeof repo === 'object' && !Array.isArray(repo)
      );

      if (validRepos.length > 0) {
        setRepos(validRepos);
      } else {
        setReposError('No repositories found or unexpected response format.');
      }
    } catch (error) {
      console.error('Error listing repos:', error);
      setReposError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingRepos(false);
    }
  }

  useEffect(() => {
    // Setup event listeners for automatic state updates
    const handleAuthComplete = () => {
      updateButtonStates();
    };

    const handleAuthError = ({ error }: { provider: string; error: Error }) => {
      console.error('Auth error:', error);
    };

    const handleAuthDisconnect = () => {
      updateButtonStates();
    };

    client.on('auth:complete', handleAuthComplete);
    client.on('auth:error', handleAuthError);
    client.on('auth:disconnect', handleAuthDisconnect);

    // Handle deep linking for OAuth callback
    const handleUrl = ({ url }: { url: string }) => {
      const { path } = Linking.parse(url);

      if (path === 'oauth/callback') {
        // The integrate-sdk client will handle the callback automatically
      }
    };

    // Add deep linking listener
    const subscription = Linking.addEventListener('url', handleUrl);

    // Initial auth check
    updateButtonStates();

    return () => {
      client.off('auth:complete', handleAuthComplete);
      client.off('auth:error', handleAuthError);
      client.off('auth:disconnect', handleAuthDisconnect);
      subscription.remove();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">GitHub OAuth Example</ThemedText>
          <HelloWave />
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 1: Connect to GitHub</ThemedText>
          <ThemedText>
            Tap the button below to {githubAuthorized ? 'disconnect from' : 'connect to'} GitHub using OAuth.
          </ThemedText>

          <Pressable
            onPress={handleGithubClick}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>
              {githubAuthorized ? 'Disconnect GitHub' : 'Connect GitHub'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        {githubAuthorized && (
          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Step 2: List Your Repositories</ThemedText>
            <ThemedText>
              Now that you&apos;re connected, you can list your GitHub repositories.
            </ThemedText>

            <Pressable
              onPress={handleListRepos}
              disabled={loadingRepos}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loadingRepos && styles.buttonDisabled,
              ]}
            >
              {loadingRepos ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  List All Repos
                </ThemedText>
              )}
            </Pressable>

            {reposError ? (
              <ThemedView
                style={styles.errorContainer}
                lightColor="#f5f5f5"
                darkColor="#1a1a1a"
              >
                <ThemedText>{reposError}</ThemedText>
              </ThemedView>
            ) : repos.length > 0 ? (
              <ThemedView
                style={styles.reposContainer}
                lightColor="#f5f5f5"
                darkColor="#1a1a1a"
              >
                <ThemedText type="subtitle">
                  {`Repositories (${repos.length}):`}
                </ThemedText>
                {repos.map((repo, index) => {
                  if (!repo || typeof repo !== 'object') {
                    return null;
                  }

                  const repoName = repo?.name || repo?.full_name || 'Unknown';
                  const repoDesc = repo?.description || '';

                  return (
                    <ThemedView
                      key={`repo-${index}-${repoName}`}
                      style={styles.repoItem}
                      lightColor="#fff"
                      darkColor="#2a2a2a"
                    >
                      <ThemedText type="defaultSemiBold">
                        {String(repoName)}
                      </ThemedText>
                      {repoDesc ? (
                        <ThemedText style={styles.repoDescription}>
                          {String(repoDesc)}
                        </ThemedText>
                      ) : null}
                    </ThemedView>
                  );
                })}
              </ThemedView>
            ) : null}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200,
    backgroundColor: '#A1CEDC',
    position: 'relative',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 20,
    position: 'absolute',
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  stepContainer: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  reposContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    maxHeight: 400,
  },
  repoItem: {
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  repoDescription: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
  },
});
