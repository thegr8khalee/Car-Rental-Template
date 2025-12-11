import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Save,
  ArrowLeft,
  Loader2,
  Send,
  FileText,
  Image,
  Users,
  Mail,
  ImageIcon,
} from 'lucide-react';
import ErrorLogger from '../components/ErrorLogger';
import { Editor } from '@tinymce/tinymce-react';
// import { useBroadcastStore } from '../store/useBroadcastStore';
import { useUserAuthStore } from '../store/useUserAuthStore';
import { useBroadcastStore } from '../store/useBroadcastStore';

const NewBroadcastPage = () => {
  const {sendBroadcast: createBroadcast, isSending: isLoading, error: backendError } = useBroadcastStore();
  const { authUser } = useUserAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  // eslint-disable-next-line no-unused-vars
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  const editorRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
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

      if (!formData.title.trim()) {
        setError('Title is required.');
        return;
      }

      const submitData = {
        title: formData.title,
        content: htmlContent,
        imageUrl: imagePreview || null,
        sentById: authUser.id,
      };

      console.log('Submitting broadcast:', submitData);

      await createBroadcast(submitData);
    } catch (err) {
      console.error('Error creating broadcast:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              className="btn btn-ghost rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">
                Create Newsletter Broadcast
              </h1>
              <p className="text-gray-600">
                Send an email to all newsletter subscribers
              </p>
            </div>
          </div>

          {error && <ErrorLogger error={error} />}
          {backendError && <ErrorLogger error={backendError} />}

          {/* Info Alert */}
          <div className="alert bg-primary/10 border-primary/20 rounded-2xl mb-8">
            <div className="flex items-start gap-3">
              <Mail className="size-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Broadcast Information</h3>
                <p className="text-sm mt-1">
                  This broadcast will be sent to all active newsletter
                  subscribers. Make sure to review your content carefully before
                  sending.
                </p>
              </div>
            </div>
          </div>

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
                        <span>Email Subject *</span>
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
                        placeholder="Enter email subject line..."
                        maxLength="200"
                        required
                      />
                    </div>

                    {/* Content Editor */}
                    <div>
                      <label className="label font-medium">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Email Content *
                        </span>
                      </label>

                      <div className="border border-base-300 rounded-md overflow-hidden">
                        <Editor
                          onInit={(evt, editor) => (editorRef.current = editor)}
                          apiKey="esh5bav8bmcm4mdbribpsniybxdqty6jszu5ctwihsw35a5y"
                          init={{
                            height: 400,
                            menubar: false,
                            plugins: [
                              'advlist autolink lists link image charmap preview anchor',
                              'searchreplace visualblocks code',
                              'insertdatetime table paste code help wordcount',
                            ],
                            toolbar:
                              'undo redo | formatselect | ' +
                              'bold italic forecolor backcolor | alignleft aligncenter ' +
                              'alignright alignjustify | bullist numlist outdent indent | ' +
                              'link image | removeformat | help',
                            content_style:
                              'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Use the editor to format your email content. You can add
                        images, links, and formatting.
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Settings & Media */}
                  <div className="space-y-6">
                    {/* Featured Image */}
                    <div className="card bg-base-200 shadow-sm rounded-2xl">
                      <div className="card-body p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Header Image (Optional)
                        </h3>

                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Header"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 btn btn-circle btn-xs bg-red-500 text-white hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="header-image"
                            />
                            <label
                              htmlFor="header-image"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600 text-center">
                                Upload Header Image
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                Recommended: 600x300px
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recipient Info */}
                    <div className="card bg-primary/10 border-2 border-primary/20 rounded-2xl">
                      <div className="card-body p-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Recipients
                        </h3>
                        <p className="text-sm">
                          This broadcast will be sent to all active newsletter
                          subscribers.
                        </p>
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-600">
                            Subscribers will receive this email at their
                            registered email address. They can unsubscribe using
                            the link in the email footer.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preview Note */}
                    <div className="card bg-base-200 shadow-sm rounded-2xl">
                      <div className="card-body p-4">
                        <h3 className="font-semibold mb-2">Email Preview</h3>
                        <p className="text-xs text-gray-600">
                          The email will include:
                        </p>
                        <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                          <li>Your subject line</li>
                          <li>Header image (if uploaded)</li>
                          <li>Formatted content</li>
                          <li>Unsubscribe link</li>
                          <li>Company branding</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="btn btn-outline rounded-full"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary rounded-full btn-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Sending Broadcast...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send to All Subscribers
                  </>
                )}
              </button>
            </div>

            {/* Warning */}
            <div className="alert alert-warning rounded-2xl">
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold">Warning</h3>
                  <div className="text-sm">
                    Once you click "Send to All Subscribers", this broadcast
                    will be immediately sent to all newsletter subscribers. This
                    action cannot be undone.
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBroadcastPage;
