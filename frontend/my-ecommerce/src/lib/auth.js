export const getStoredUser = () => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

export const getStoredToken = () => localStorage.getItem('token')

export const getAuthConfig = () => {
  const token = getStoredToken()

  if (!token) {
    throw new Error('Please login first.')
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}
