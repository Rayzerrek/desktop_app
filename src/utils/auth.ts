type Tokens = {
  access_token?: string
  refresh_token?: string
  user_id?: string
}


function saveAuthTokens(tokens: Tokens) {
  if (tokens.access_token) {
    localStorage.setItem('access_token', tokens.access_token)
  }
  if (tokens.refresh_token) {
    localStorage.setItem('refresh_token', tokens.refresh_token)
  }
  if (tokens.user_id) {
    localStorage.setItem('user_id', tokens.user_id)
  }
}

function clearAuthTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_id')
}
function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token')
}

export {
  saveAuthTokens,
  clearAuthTokens,
  isAuthenticated
}
