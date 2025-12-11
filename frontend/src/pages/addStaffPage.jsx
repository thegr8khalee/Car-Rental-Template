import React, { useState } from 'react';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import { useAdminStaffStore } from '../store/useAdminStaffStore';
import ErrorLogger from '../components/ErrorLogger';

const AddStaffPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: '',
    role: 'editor',
    bio: '',
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { isLoading, addStaff, error } = useAdminStaffStore();

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'moderator', label: 'Moderator' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setAvatar(base64String);
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const staffData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        position: formData.position,
        role: formData.role,
        bio: formData.bio || null,
        avatar: avatar || null,
      };

      const success = await addStaff(staffData);

      if (success) {
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          position: '',
          role: 'editor',
          bio: '',
        });
        setAvatar(null);
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              className="btn btn-ghost rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Add New Staff Member</h1>
              <p className="text-gray-600">
                Create a new admin account with specific permissions
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && <ErrorLogger error={error} />}

          {/* Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <label className="label font-medium">Profile Picture</label>
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-dashed border-gray-300">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="btn btn-outline btn-sm rounded-full mt-3"
                >
                  {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>

              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="label font-medium">
                    <span className="label-text">Username *</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input input-bordered w-full rounded-full"
                    placeholder="johndoe"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label font-medium">
                    <span className="label-text">Email *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input input-bordered w-full rounded-full"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label font-medium">
                      <span className="label-text">Password *</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-full"
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>
                  <div>
                    <label className="label font-medium">
                      <span className="label-text">Confirm Password *</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-full"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="label font-medium">
                    <span className="label-text">Position *</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="input input-bordered w-full rounded-full"
                    placeholder="e.g., Content Manager, Sales Manager"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="label font-medium">
                    <span className="label-text">Role *</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="select select-bordered w-full rounded-full"
                    required
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Super Admin:</strong> Full access to all features
                    <br />
                    <strong>Editor:</strong> Can manage content (cars, blogs)
                    <br />
                    <strong>Moderator:</strong> Can manage reviews and comments
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="label font-medium">
                    <span className="label-text">Bio (Optional)</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered w-full h-24 rounded-3xl"
                    placeholder="Brief description about the staff member..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary rounded-full px-8"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Adding Staff...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Add Staff Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStaffPage;
