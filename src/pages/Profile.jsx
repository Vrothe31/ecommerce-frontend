import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function Profile() {
  const { user, login } = useAuthStore()
  const [profile, setProfile] = useState({ name: '', phone: '', avatarUrl: '' })
  const [addresses, setAddresses] = useState([])
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', addressLine: '', city: '', state: '', pincode: '', isDefault: false
  })
  const [showAddressForm, setShowAddressForm] = useState(false)

  const fetchData = () => {
    api.get('/users/profile').then(res => setProfile(res.data))
    api.get('/addresses').then(res => setAddresses(res.data))
  }

  useEffect(() => { fetchData() }, [])

  const saveProfile = async () => {
    try {
      const res = await api.put('/users/profile', profile)
      const state = useAuthStore.getState()
      login({ ...res.data, token: state.token, refreshToken: state.refreshToken })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    }
  }

  const changePassword = async () => {
    try {
      await api.post('/users/change-password', passwords)
      toast.success('Password changed')
      setPasswords({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed')
    }
  }

  const addAddress = async () => {
    try {
      await api.post('/addresses', newAddress)
      toast.success('Address added')
      setShowAddressForm(false)
      setNewAddress({ name: '', phone: '', addressLine: '', city: '', state: '', pincode: '', isDefault: false })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add address')
    }
  }

  const deleteAddress = async (id) => {
    await api.delete(`/addresses/${id}`)
    toast.success('Address deleted')
    fetchData()
  }

  const setDefault = async (id) => {
    await api.patch(`/addresses/${id}/default`)
    fetchData()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4 dark:text-white">Personal Info</h2>
        <div className="space-y-3">
          <input value={profile.name || ''} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Name" className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-4 py-2" />
          <input value={user?.email || ''} disabled
            className="w-full border dark:border-gray-700 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-400" />
          <input value={profile.phone || ''} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
            placeholder="Phone" className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-4 py-2" />
          <input value={profile.avatarUrl || ''} onChange={e => setProfile(p => ({ ...p, avatarUrl: e.target.value }))}
            placeholder="Avatar URL" className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-4 py-2" />
          <button onClick={saveProfile} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Save</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4 dark:text-white">Change Password</h2>
        <div className="space-y-3">
          <input type="password" value={passwords.currentPassword}
            onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
            placeholder="Current Password" className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-4 py-2" />
          <input type="password" value={passwords.newPassword}
            onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
            placeholder="New Password" className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-4 py-2" />
          <button onClick={changePassword} className="bg-gray-800 dark:bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-900">Change Password</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold dark:text-white">Delivery Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)}
            className="text-sm text-blue-600 hover:underline">+ Add Address</button>
        </div>

        {showAddressForm && (
          <div className="space-y-2 mb-4 p-4 border dark:border-gray-700 rounded-lg">
            {['name', 'phone', 'addressLine', 'city', 'state', 'pincode'].map(field => (
              <input key={field} value={newAddress[field]}
                onChange={e => setNewAddress(a => ({ ...a, [field]: e.target.value }))}
                placeholder={field} className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
            ))}
            <label className="flex items-center gap-2 text-sm dark:text-gray-300">
              <input type="checkbox" checked={newAddress.isDefault}
                onChange={e => setNewAddress(a => ({ ...a, isDefault: e.target.checked }))} />
              Set as default
            </label>
            <button onClick={addAddress} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Save Address</button>
          </div>
        )}

        {addresses.map(a => (
          <div key={a.id} className="p-3 border dark:border-gray-700 rounded-lg mb-2 text-sm dark:text-gray-300">
            <div className="flex justify-between">
              <span className="font-medium">{a.name} {a.isDefault && <span className="text-blue-600 text-xs">(Default)</span>}</span>
              <div className="flex gap-2">
                {!a.isDefault && <button onClick={() => setDefault(a.id)} className="text-blue-600 text-xs">Set Default</button>}
                <button onClick={() => deleteAddress(a.id)} className="text-red-500 text-xs">Delete</button>
              </div>
            </div>
            <p>{a.addressLine}, {a.city}, {a.state} - {a.pincode}</p>
            <p className="text-gray-400">{a.phone}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
