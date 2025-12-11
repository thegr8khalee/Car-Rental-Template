import React, { useState } from 'react';
import {
  Upload,
  X,
  ArrowLeft,
  Send,
  CheckCircle,
  File,
  DollarSign,
  Zap,
} from 'lucide-react';
import { useSellStore } from '../store/useSellStore';

const SellCarPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
    condition: '',
    additionalNotes: '',
  });

  const { submitSellForm, isSubmitting, error, successMessage } =
    useSellStore();

  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const conditionOptions = ['Excellent', 'Good', 'Needs Work'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setImages((prev) => [...prev, base64String]);
        setImagePreview((prev) => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.make ||
      !formData.model ||
      !formData.year ||
      !formData.mileage ||
      !formData.condition
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const sellData = {
      ...formData,
      images: images, // base64 images array
      year: parseInt(formData.year),
      mileage: parseInt(formData.mileage),
    };

    const success = await submitSellForm(sellData);

    if (success) {
      setIsSubmitted(true);

      // Reset form after showing success message
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          fullName: '',
          phoneNumber: '',
          email: '',
          make: '',
          model: '',
          year: '',
          mileage: '',
          condition: '',
          additionalNotes: '',
        });
        setImages([]);
        setImagePreview([]);
      }, 3000);
    }
  };

  if (isSubmitted) {
    return (
      <div className="pt-16 min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
          <div className="card-body text-center">
            <CheckCircle className="h-20 w-20 text-success mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">
              Your car details have been submitted successfully. Our team will
              review your submission and get back to you within 24 hours with a
              fair, no-obligation offer.
            </p>
            <p className="text-sm text-gray-500">
              Check your email for confirmation and next steps.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <section className="w-full sticky top-0 bg-secondary pt-16 px-4 h-16 z-50">
          <hr className="border-t border-gray-500" />
        </section>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              className="btn btn-ghost rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Sell Your Car Today
              </h1>
              <p className="text-gray-600 mt-1">
                Get Instant Valuation – Fill out the form below
              </p>
            </div>
          </div>

          <div className="alert bg-primary/10 rounded-2xl mb-8">
            <div>
              <h3 className="font-semibold text-lg">Quick & Easy Process</h3>
              <p className="text-sm mt-1">
                Our team will get back to you within 24 hours with a fair,
                no-obligation offer. We handle all the paperwork and make
                selling your car hassle-free!
              </p>
            </div>
          </div>

          {error && (
            <div className="alert alert-error rounded-2xl mb-8">
              <span>{error}</span>
            </div>
          )}

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label font-medium">
                      <span className="label-text">Full Name *</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-full"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="label font-medium">
                      <span className="label-text">Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-full"
                      placeholder="+234 800 000 0000"
                      required
                    />
                  </div>

                  <div>
                    <label className="label font-medium">
                      <span className="label-text">Email Address *</span>
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
                </div>
              </div>

              <div className="divider"></div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Car Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label font-medium">
                      <span className="label-text">Car Make *</span>
                    </label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-full"
                      placeholder="e.g., Toyota, Honda, Mercedes"
                      required
                    />
                  </div>

                  <div>
                    <label className="label font-medium">
                      <span className="label-text">Car Model *</span>
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-full"
                      placeholder="e.g., Corolla, Civic, C-Class"
                      required
                    />
                  </div>

                  <div>
                    <label className="label font-medium">
                      <span className="label-text">Year of Manufacture *</span>
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-full"
                      placeholder="2020"
                      min="1980"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>

                  <div>
                    <label className="label font-medium">
                      <span className="label-text">Mileage (in km) *</span>
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-full"
                      placeholder="50000"
                      min="0"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label font-medium">
                      <span className="label-text">Condition *</span>
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="select select-bordered w-full rounded-full"
                      required
                    >
                      <option value="">Select Condition</option>
                      {conditionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Upload Photos</h2>
                <p className="text-sm text-gray-600 mb-4">
                  (Optional, but recommended - up to 10 images)
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-primary transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-16 w-16 text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-gray-700 mb-2">
                      Click to upload car photos
                    </span>
                    <span className="text-sm text-gray-500">
                      JPG, PNG or JPEG (Max 10 images)
                    </span>
                  </label>
                </div>

                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                    {imagePreview.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="divider"></div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Additional Notes</h2>
                <p className="text-sm text-gray-600 mb-4">(Optional)</p>

                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full h-32 rounded-3xl"
                  placeholder="Tell us anything else about your car - special features, service history, recent repairs, etc."
                />
              </div>

              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary btn-lg rounded-full px-12 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Get My Offer
                    </>
                  )}
                </button>
              </div>

              {successMessage && (
                <div className="alert alert-success rounded-2xl mt-8">
                  <span>{successMessage}</span>
                </div>
              )}

              <p className="text-center text-sm text-gray-500 mt-4">
                By submitting this form, you agree to our terms and conditions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-8">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center items-center justify-center">
                <Zap className="text-primary size-10" />
                <h3 className="font-bold text-lg">Quick Response</h3>
                <p className="text-sm text-gray-600">
                  Get your offer within 24 hours
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center items-center justify-center">
                <DollarSign className="text-primary size-10" />
                <h3 className="font-bold text-lg">Fair Pricing</h3>
                <p className="text-sm text-gray-600">
                  Competitive market-based valuations
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center items-center justify-center">
                <File className="text-primary size-10" />
                <h3 className="font-bold text-lg">Hassle-Free</h3>
                <p className="text-sm text-gray-600">
                  We handle all the paperwork
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellCarPage;
