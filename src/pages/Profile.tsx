export default function Profile() {
  return (
    <div className="max-w-md bg-white p-6 rounded-xl shadow-sm">

      <h1 className="text-xl font-semibold mb-4">Profile</h1>

      <div className="space-y-3">

        <input className="w-full border p-2 rounded" placeholder="Name" />
        <input className="w-full border p-2 rounded" placeholder="Email" />
        <input className="w-full border p-2 rounded" placeholder="Role" />

        <button className="w-full bg-black text-white py-2 rounded">
          Update Profile
        </button>

      </div>

    </div>
  )
}