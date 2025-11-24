import { useEffect, useState } from '@lynx-js/react'

import './App.css'
import { client } from './lib/integrate'

interface Repo {
  name?: string;
  full_name?: string;
  description?: string;
  html_url?: string;
}

export function App(props: {
  onRender?: () => void
}) {
  const [githubAuthorized, setGithubAuthorized] = useState(false)
  const [repos, setRepos] = useState<Repo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [reposError, setReposError] = useState<string | null>(null)

  async function updateButtonStates(context = 'unknown') {
    try {
      const authorized = await client.isAuthorized('github')
      setGithubAuthorized(authorized)
    } catch (error) {
      console.error(`[updateButtonStates] Error checking authorization (context: ${context}):`, error)
    }
  }

  async function handleGithubClick() {
    try {
      if (githubAuthorized) {
        await client.disconnectProvider('github')
        await updateButtonStates('after-disconnect')
      } else {
        await client.authorize('github')
      }
    } catch (error) {
      console.error('Error in handleGithubClick:', error)
    }
  }

  async function handleListRepos() {
    setLoadingRepos(true)
    setReposError(null)
    setRepos([])

    try {
      const response = await client.github.listOwnRepos()

      // Extract repos from MCPToolCallResponse
      let extractedRepos: Repo[] = []

      if (
        response.structuredContent &&
        Array.isArray(response.structuredContent)
      ) {
        extractedRepos = response.structuredContent as Repo[]
      } else if (response.content && response.content.length > 0) {
        // Try to parse JSON from text content
        const textContent = response.content[0]?.text
        if (textContent) {
          try {
            const parsed = JSON.parse(textContent)
            extractedRepos = Array.isArray(parsed)
              ? parsed
              : parsed.repos || parsed.repositories || []
          } catch {
            extractedRepos = []
          }
        }
      }

      // Filter and validate repos to ensure they're objects
      const validRepos = extractedRepos.filter(repo =>
        repo && typeof repo === 'object' && !Array.isArray(repo)
      )

      if (validRepos.length > 0) {
        setRepos(validRepos)
      } else {
        setReposError('No repositories found or unexpected response format.')
      }
    } catch (error) {
      console.error('Error listing repos:', error)
      setReposError(error instanceof Error ? error.message : String(error))
    } finally {
      setLoadingRepos(false)
    }
  }

  useEffect(() => {
    // Initial auth check
    updateButtonStates('initial-mount')

    // Delayed check after mount
    const timeout = setTimeout(() => {
      updateButtonStates('delayed-mount-check')
    }, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  props.onRender?.()

  return (
    <view className='App'>
      <view className='Background' />
      <view className='Container'>
        <view className='Header'>
          <text className='Title'>GitHub OAuth Example</text>
        </view>

        <view className='Content'>
          <view className='StepContainer'>
            <text className='Subtitle'>Step 1: Connect to GitHub</text>
            <text className='Description'>
              Tap the button below to {githubAuthorized ? 'disconnect from' : 'connect to'} GitHub using OAuth.
            </text>

            <view
              className={`Button ${loadingRepos ? 'Button--disabled' : ''}`}
              bindtap={handleGithubClick}
            >
              <text className='ButtonText'>
                {githubAuthorized ? 'Disconnect GitHub' : 'Connect GitHub'}
              </text>
            </view>
          </view>

          {githubAuthorized && (
            <view className='StepContainer'>
              <text className='Subtitle'>Step 2: List Your Repositories</text>
              <text className='Description'>
                Now that you&apos;re connected, you can list your GitHub repositories.
              </text>

              <view
                className={`Button ${loadingRepos ? 'Button--disabled' : ''}`}
                bindtap={handleListRepos}
              >
                {loadingRepos ? (
                  <text className='ButtonText'>Loading...</text>
                ) : (
                  <text className='ButtonText'>List All Repos</text>
                )}
              </view>

              {reposError ? (
                <view className='ErrorContainer'>
                  <text className='ErrorText'>{reposError}</text>
                </view>
              ) : repos.length > 0 ? (
                <view className='ReposContainer'>
                  <text className='Subtitle'>
                    {`Repositories (${repos.length}):`}
                  </text>
                  {repos.map((repo, index) => {
                    if (!repo || typeof repo !== 'object') {
                      return null
                    }

                    const repoName = repo?.name || repo?.full_name || 'Unknown'
                    const repoDesc = repo?.description || ''

                    return (
                      <view
                        key={`repo-${index}-${repoName}`}
                        className='RepoItem'
                      >
                        <text className='RepoName'>
                          {String(repoName)}
                        </text>
                        {repoDesc ? (
                          <text className='RepoDescription'>
                            {String(repoDesc)}
                          </text>
                        ) : null}
                      </view>
                    )
                  })}
                </view>
              ) : null}
            </view>
          )}
        </view>
      </view>
    </view>
  )
}
