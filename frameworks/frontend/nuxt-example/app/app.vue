<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { client } from 'integrate-sdk'

interface Repo {
  name?: string
  full_name?: string
  description?: string
  html_url?: string
}

const githubAuthorized = ref(false)
const repos = ref<Repo[]>([])
const loadingRepos = ref(false)
const reposError = ref<string | null>(null)

async function updateButtonStates() {
  try {
    githubAuthorized.value = await client.isAuthorized('github')
  } catch (error) {
    console.error('Error checking authorization:', error)
  }
}

async function handleGithubClick() {
  try {
    if (githubAuthorized.value) {
      await client.disconnectProvider('github')
    } else {
      await client.authorize('github')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

async function handleListRepos() {
  loadingRepos.value = true
  reposError.value = null
  repos.value = []

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

    if (extractedRepos.length > 0) {
      repos.value = extractedRepos
    } else {
      reposError.value = 'No repositories found or unexpected response format.'
      console.log('Response:', response)
    }
  } catch (error) {
    console.error('Error listing repos:', error)
    reposError.value = error instanceof Error ? error.message : String(error)
  } finally {
    loadingRepos.value = false
  }
}

onMounted(() => {
  // Setup event listeners for automatic state updates
  const handleAuthComplete = () => {
    updateButtonStates()
  }

  const handleAuthError = ({ error }: { provider: string; error: Error }) => {
    console.error('Auth error:', error)
  }

  const handleAuthDisconnect = () => {
    updateButtonStates()
  }

  client.on('auth:complete', handleAuthComplete)
  client.on('auth:error', handleAuthError)
  client.on('auth:disconnect', handleAuthDisconnect)

  // Initial auth check
  updateButtonStates()

  onUnmounted(() => {
    client.off('auth:complete', handleAuthComplete)
    client.off('auth:error', handleAuthError)
    client.off('auth:disconnect', handleAuthDisconnect)
  })
})
</script>

<template>
  <button @click="handleGithubClick">
    {{ githubAuthorized ? 'Disconnect Github' : 'Connect Github' }}
  </button>

  <div v-if="githubAuthorized" class="repos-section">
    <button @click="handleListRepos" :disabled="loadingRepos">
      {{ loadingRepos ? 'Loading...' : 'List All Repos' }}
    </button>

    <div v-if="reposError" class="repos-output">
      <p>{{ reposError }}</p>
    </div>

    <div v-else-if="repos.length > 0" class="repos-output">
      <h3>Repositories ({{ repos.length }}):</h3>
      <ul>
        <li v-for="(repo, index) in repos" :key="index">
          <strong>{{ repo.name || repo.full_name || 'Unknown' }}</strong>
          <template v-if="repo.description">
            <br />
            <small>{{ repo.description }}</small>
          </template>
          <template v-if="repo.html_url">
            <br />
            <a
              :href="repo.html_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>
