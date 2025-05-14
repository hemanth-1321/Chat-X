'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Globe2, LocateIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { BACKENDURL } from '@/lib/config'
import { toast } from 'sonner'

type User = {
  name: string
  email: string
  location: string
  portfolio: string
  bio: string
  createdAt: string
}

export default function ProfileCard() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get(`${BACKENDURL}/auth/profile`, {
      headers: {
        Authorization: token,
      },
    })
      .then(res => {
        setUser(res.data.user)
        setFormData(res.data.user)
      })
      .catch(err => {
        console.error('Failed to fetch user:', err)
        toast.error('Failed to load profile')
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev!, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.put(`${BACKENDURL}/auth/profile/update`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })

      if (res.status === 201) {
        setUser(res.data)
        setIsEditing(false)
        toast.success('Profile updated')
      } else {
        toast.error('Failed to update user')
      }
    } catch (err) {
      console.error('Failed to update user:', err)
      toast.error('Failed to update user')
    }
  }

  if (!user) return <p className="text-center text-gray-500 dark:text-gray-300 mt-20">Loading...</p>

  return (
    <div className="flex justify-center items-center mt-28 px-4 text-black dark:text-white ">
      <div className="w-full max-w-2xl bg-gray-400 dark:bg-gray-700 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-6 text-white border border-white/10">

        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <Avatar className="w-20 h-20">
            <AvatarImage src="/avatar.jpg" alt="Profile photo" />
            <AvatarFallback className='text-black dark:text-white'>
              {(user.name?.slice(0, 2) || '??').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 w-full">
            {isEditing ? (
              <>
                <Input
                  name="name"
                  value={formData?.name}
                  onChange={handleChange}
                  placeholder="Name"
                />
                <Input
                  name="email"
                  value={formData?.email}
                  onChange={handleChange}
                  className="mt-2"
                  placeholder="Email"
                />
                <Textarea
                  name="bio"
                  value={formData?.bio}
                  onChange={handleChange}
                  className="mt-3"
                  placeholder="Bio"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user.name}</h2>
                <p className="text-sm text-gray-700 dark:text-gray-400">{user.email}</p>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-400">{user.bio}</p>
              </>
            )}

            <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-4 text-sm text-muted">
              <div className="flex items-center gap-1">
                <LocateIcon className="w-4 h-4" />
                {isEditing ? (
                  <Input
                    name="location"
                    value={formData?.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="w-full sm:w-auto"
                  />
                ) : (
                  <span className="text-gray-700 dark:text-gray-400">{user.location}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Globe2 className="w-4 h-4" />
                {isEditing ? (
                  <Input
                    name="portfolio"
                    value={formData?.portfolio}
                    onChange={handleChange}
                    placeholder="Portfolio URL"
                    className="w-full sm:w-auto"
                  />
                ) : (
                  <span className="text-gray-700 dark:text-gray-400">{user.portfolio}</span>
                )}
              </div>

            
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>
    </div>
  )
}
