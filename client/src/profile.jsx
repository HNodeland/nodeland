import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/profile', { withCredentials: true })
      .then(res => {
        setUser(res.data.user)
      })
      .catch(err => {
        console.error('Profile fetch failed:', err)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p>Loading profile…</p>
  }

  // After loading completes, if no user, redirect to home (or show a message)
  if (!user) {
    // Option A: redirect back to home
    // navigate('/')
    // return null

    // Option B: show a message with a link
    return (
      <div className="p-6">
        <p className="text-red-500">You must be logged in to view this page.</p>
        <Link to="/" className="text-blue-500 hover:underline">&larr; Back to Home</Link>
      </div>
    )
  }

  // We have a user—show their info
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Name:</strong> {user.displayName}</p>
      <Link to="/" className="mt-6 inline-block text-blue-500 hover:underline">&larr; Back to Home</Link>
    </div>
  )
}
