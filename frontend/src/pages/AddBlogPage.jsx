import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  Plus,
  Save,
  ArrowLeft,
  Loader2,
  Search,
  Eye,
  Calendar,
  Tag,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  SearchIcon,
} from 'lucide-react';
import ErrorLogger from '../components/ErrorLogger';
import { useCarStore } from '../store/useCarStore';
import { Editor } from '@tinymce/tinymce-react';
import { useAdminOpsStore } from '../store/useAdminOpsStore';
import { useUserAuthStore } from '../store/useUserAuthStore';

const AddBlogPage = () => {
  const { search, isSearching, searchResults } = useCarStore();
  const {
    addBlog,
    isLoading: isBlogLoading,
    error: backendError,
  } = useAdminOpsStore();
  const { authUser } = useUserAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    content: '',
    category: '',
    status: 'draft',
    carIds: [],
    tags: [],
    seoTitle: '',
    seoDescription: '',
    publishedAt: '',
    author: {},
  });

  // eslint-disable-next-line no-unused-vars
  const [images, setImages] = useState({
    imageUrl: null,
    featuredImage: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    imageUrls: '',
    featuredImage: '',
  });

  const [selectedCars, setSelectedCars] = useState([]);
  const [searchData, setSearchData] = useState({ carSearchQuery: '' });
  const [showCarDropdown, setShowCarDropdown] = useState(false);

  // Tags state
  const [newTag, setNewTag] = useState('');

  // Loading and error states
  //   const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');

  // Refs
  const carDropdownRef = useRef(null);

  // Category options
  const categoryOptions = [
    { value: 'reviews', label: 'Reviews' },
    { value: 'news', label: 'News' },
    { value: 'comparisons', label: 'Comparisons' },
    { value: 'buying_guide', label: 'Buying Guide' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'technology', label: 'Technology' },
    { value: 'industry_insights', label: 'Industry Insights' },
    { value: 'events', label: 'Events' },
    { value: 'lifestyle', label: 'Lifestyle' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        carDropdownRef.current &&
        !carDropdownRef.current.contains(event.target)
      ) {
        setShowCarDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImages((prev) => ({
        ...prev,
        [imageType]: file,
      }));
      setImagePreviews((prev) => ({
        ...prev,
        [imageType]: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imageType) => {
    setImages((prev) => ({
      ...prev,
      [imageType]: null,
    }));
    setImagePreviews((prev) => ({
      ...prev,
      [imageType]: '',
    }));
  };

  const handleCarSelection = (car) => {
    if (!selectedCars.find((selected) => selected.id === car.id)) {
      const newSelectedCars = [...selectedCars, car];
      setSelectedCars(newSelectedCars);
      setFormData((prev) => ({
        ...prev,
        carIds: newSelectedCars.map((c) => c.id),
      }));
    }
    setSearchData('');
    setShowCarDropdown(false);
  };

  const removeCar = (carId) => {
    const newSelectedCars = selectedCars.filter((car) => car.id !== carId);
    setSelectedCars(newSelectedCars);
    setFormData((prev) => ({
      ...prev,
      carIds: newSelectedCars.map((c) => c.id),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      const updatedTags = [...formData.tags, newTag.trim()];
      setFormData((prev) => ({
        ...prev,
        tags: updatedTags,
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const htmlContent = editorRef.current?.getContent() || '';
      if (!htmlContent.replace(/<[^>]*>/g, '').trim()) {
        setError('Content cannot be empty.');
        return;
      }

      // Use Base64 images from imagePreviews
      const submitData = {
        ...formData,
        content: htmlContent,
        author: {
          id: authUser.id,
          name: authUser.username,
          avatarUrl: authUser.avatarUrl,
        },
        publishedAt:
          formData.status === 'scheduled' ? formData.publishedAt : null,
        imageUrls: imagePreviews.imageUrls || null,
        featuredImage: imagePreviews.featuredImage || null,
      };

      console.log('Submitting blog:', submitData);

      const response = await addBlog(submitData); // backend should accept Base64
      if (!response.ok) throw new Error('Failed to create blog');

      // Optional: reset form or show success
    } catch (err) {
      console.error('Error creating blog:', err);
      setError(err.message);
    }
  };

  const handleSearch = (query) => {
    setSearchData({ carSearchQuery: query });
    search(query);
    setShowCarDropdown(true);
    };

  const editorRef = useRef(null);

  //   console.log('Search Data:', searchData);
  //   console.log('Searched Cars:', searchResults);

  return (
    <div className="min-h-screen bg-base-200 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              className="btn btn-ghost rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Create New Blog Post</h1>
              <p className="text-gray-600">
                Write and publish your blog content
              </p>
            </div>
          </div>

          {/* {error && <ErrorLogger error={error} />} */}
          {backendError && <ErrorLogger error={backendError} />}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Content Card */}
            <div className="card bg-base-100 rounded-3xl shadow-xl">
              <div className="card-body">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div>
                      <label className="label font-medium">
                        <span>Title *</span>
                        <span className="text-xs text-gray-500">
                          {formData.title.length}/200
                        </span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="input input-bordered w-full rounded-full"
                        placeholder="Enter blog title..."
                        maxLength="200"
                        required
                      />
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="label font-medium">
                        <span>Tagline</span>
                        <span className="text-xs text-gray-500">
                          {formData.tagline.length}/300
                        </span>
                      </label>
                      <input
                        type="text"
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleInputChange}
                        className="input input-bordered w-full rounded-full"
                        placeholder="Brief description of your post..."
                        maxLength="300"
                      />
                    </div>

                    {/* Content Editor */}
                    <div>
                      <label className="label font-medium">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Content *
                        </span>
                      </label>

                      <div className="border border-base-300 rounded-md overflow-hidden">
                        <Editor
                          onInit={(evt, editor) => (editorRef.current = editor)}
                          apiKey="esh5bav8bmcm4mdbribpsniybxdqty6jszu5ctwihsw35a5y"
                          init={{
                            height: 300,
                            menubar: false,
                            plugins: [
                              'advlist autolink lists link image charmap print preview anchor',
                              'searchreplace visualblocks code fullscreen',
                              'insertdatetime media table paste code help wordcount',
                            ],
                            toolbar:
                              'undo redo | formatselect | ' +
                              'bold italic backcolor | alignleft aligncenter ' +
                              'alignright alignjustify | bullist numlist outdent indent | ' +
                              'removeformat | help',
                            content_style:
                              'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Settings & Media */}
                  <div className="space-y-6">
                    {/* Publication Settings */}
                    <div className="card bg-base-200 shadow-sm rounded-2xl">
                      <div className="card-body p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Publication
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="label font-medium">Status</label>
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleInputChange}
                              className="select select-bordered w-full rounded-full"
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {formData.status === 'scheduled' && (
                            <div>
                              <label className="label font-medium">
                                Publish Date
                              </label>
                              <input
                                type="datetime-local"
                                name="publishedAt"
                                value={formData.publishedAt}
                                onChange={handleInputChange}
                                className="input input-bordered w-full rounded-full"
                              />
                            </div>
                          )}

                          <div>
                            <label className="label font-medium">
                              Category *
                            </label>
                            <select
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              className="select select-bordered w-full rounded-full"
                              required
                            >
                              <option value="">Select Category</option>
                              {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Featured Image */}
                    <div className="card bg-base-200 shadow-sm rounded-2xl">
                      <div className="card-body p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Featured Image
                        </h3>

                        {imagePreviews.featuredImage ? (
                          <div className="relative">
                            <img
                              src={imagePreviews.featuredImage}
                              alt="Featured"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('featuredImage')}
                              className="absolute top-2 right-2 btn btn-circle btn-xs bg-red-500 text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(e, 'featuredImage')
                              }
                              className="hidden"
                              id="featured-image"
                            />
                            <label
                              htmlFor="featured-image"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">
                                Upload Featured Image
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Image */}
                    <div className="card bg-base-200 rounded-2xl shadow-sm">
                      <div className="card-body p-4">
                        <h3 className="font-semibold mb-4">Additional Image</h3>

                        {imagePreviews.imageUrls ? (
                          <div className="relative">
                            <img
                              src={imagePreviews.imageUrls}
                              alt="Additional"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('imageUrls')}
                              className="absolute top-2 right-2 btn btn-circle btn-xs bg-red-500 text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'imageUrls')}
                              className="hidden"
                              id="additional-image"
                            />
                            <label
                              htmlFor="additional-image"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">
                                Upload Image
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Cars Section */}
            <div className="card bg-base-100 rounded-2xl shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">Related Cars</h3>

                {/* Car Search Dropdown */}
                <div className="relative" ref={carDropdownRef}>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchData.carSearchQuery}
                        onChange={(e) =>
                          setSearchData({ carSearchQuery: e.target.value })
                        }
                        // onFocus={() => setShowCarDropdown(true)}
                        className="input input-bordered w-full pr-10 rounded-l-full"
                        placeholder="Search for cars..."
                      />
                      <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleSearch(searchData.carSearchQuery);
                        setShowCarDropdown(true);
                      }}
                      className="btn btn-primary rounded-r-full"
                    >
                      <SearchIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Dropdown */}
                  {showCarDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center">
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Loading cars...
                        </div>
                      ) : searchResults?.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No cars found
                        </div>
                      ) : (
                        searchResults.map((car) => (
                          <button
                            key={car.id}
                            type="button"
                            onClick={() => handleCarSelection(car)}
                            className="w-full text-left p-3 hover:bg-base-200 border-b border-base-300 last:border-b-0"
                            disabled={selectedCars.some(
                              (selected) => selected.id === car.id
                            )}
                          >
                            <div className="font-medium">
                              {car.year} {car.make} {car.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.condition} • ${car.price?.toLocaleString()}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Cars */}
                {selectedCars.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Selected Cars:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCars.map((car) => (
                        <div
                          key={car.id}
                          className="badge badge-lg badge-outline gap-2 py-3 px-4"
                        >
                          <span>
                            {car.year} {car.make} {car.model}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCar(car.id)}
                            className="hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags & SEO Section */}
            <div className="card bg-base-100 rounded-2xl shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags & SEO
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tags */}
                  <div>
                    <label className="label font-medium">Tags</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="input input-bordered flex-1 rounded-l-full"
                        placeholder="Add a tag..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="btn btn-primary rounded-r-full"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <div
                            key={index}
                            className="badge badge-lg badge-outline gap-2 py-3 px-4"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEO */}
                  <div className="space-y-4">
                    <div>
                      <label className="label font-medium">
                        <span>SEO Title</span>
                        <span className="text-xs text-gray-500">
                          {formData.seoTitle.length}/60
                        </span>
                      </label>
                      <input
                        type="text"
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleInputChange}
                        className="input input-bordered w-full rounded-full"
                        placeholder="SEO optimized title..."
                        maxLength="60"
                      />
                    </div>

                    <div>
                      <label className="label font-medium">
                        <span>SEO Description</span>
                        <span className="text-xs text-gray-500">
                          {formData.seoDescription.length}/160
                        </span>
                      </label>
                      <textarea
                        name="seoDescription"
                        value={formData.seoDescription}
                        onChange={handleInputChange}
                        className="textarea textarea-bordered w-full h-20 rounded-xl"
                        placeholder="Brief description for search engines..."
                        maxLength="160"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                className="btn btn-outline rounded-full"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, status: 'draft' }));
                    handleSubmit();
                  }}
                  className="btn btn-ghost"
                  disabled={isBlogLoading}
                >
                  Save as Draft
                </button>

                <button
                  type="submit"
                  className="btn btn-primary rounded-full"
                  disabled={isBlogLoading}
                >
                  {isBlogLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Blog Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBlogPage;
