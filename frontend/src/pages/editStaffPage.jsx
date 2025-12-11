import React, { useState, useEffect } from 'react';
import { Upload, X, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAdminStaffStore } from '../store/useAdminStaffStore';
import ErrorLogger from '../components/ErrorLogger';
import { useParams } from 'react-router-dom';

const EditStaffPage = () => {
  const { id } = useParams();
  const { isLoading, updateStaff, getStaffById, error } = useAdminStaffStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    position: '',
    role: 'editor',
    bio: '',
    changePassword: false,
    newPassword: '',
    confirmPassword: '',
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [existingAvatar, setExistingAvatar] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'moderator', label: 'Moderator' },
  ];

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staff = await getStaffById(id);
        if (staff) {
          setFormData({
            username: staff.username || '',
            email: staff.email || '',
            position: staff.position || '',
            role: staff.role || 'editor',
            bio: staff.bio || '',
            changePassword: false,
            newPassword: '',
            confirmPassword: '',
          });
          if (staff.avatar) {
            setExistingAvatar(staff.avatar);
            setAvatarPreview(staff.avatar);
          }
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchStaff();
  }, [id, getStaffById]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    setExistingAvatar(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for password change
    if (formData.changePassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
    }

    try {
      const staffData = {
        username: formData.username,
        email: formData.email,
        position: formData.position,
        role: formData.role,
        bio: formData.bio || null,
      };

      // Include password only if user wants to change it
      if (formData.changePassword && formData.newPassword) {
        staffData.password = formData.newPassword;
      }

      // Handle avatar
      if (avatar) {
        // New avatar uploaded
        staffData.avatar = avatar;
      } else if (existingAvatar) {
        // Keep existing avatar
        staffData.avatar = existingAvatar;
      } else {
        // No avatar
        staffData.avatar = null;
      }

      await updateStaff(id, staffData);
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold">Edit Staff Member</h1>
              <p className="text-gray-600">
                Update staff account information
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
                    required
                  />
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

                {/* Password Change Section */}
                <div className="divider"></div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      name="changePassword"
                      checked={formData.changePassword}
                      onChange={handleInputChange}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text font-medium">Change Password</span>
                  </label>
                </div>

                {formData.changePassword && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label font-medium">
                        <span className="label-text">New Password *</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="input input-bordered w-full rounded-full"
                        placeholder="Min. 6 characters"
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
                      />
                    </div>
                  </div>
                )}
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
                      Updating Staff...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Staff Member
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

export default EditStaffPage;
