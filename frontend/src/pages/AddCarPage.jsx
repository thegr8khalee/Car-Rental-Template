import React, { useState } from 'react';
import { Upload, X, Plus, Save, ArrowLeft } from 'lucide-react';
import { useAdminOpsStore } from '../store/useAdminOpsStore';
// import { error } from 'console';
import ErrorLogger from '../components/ErrorLogger';
// import { color } from 'framer-motion';

const AddCarPage = () => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    price: '',
    condition: '',
    msrp: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    year: '',
    bodyType: '',
  category: '',
    engineSize: '',
    horsepower: '',
    torque: '',
    drivetrain: '',
    description: '',
    sold: false,
    interior: [],
    exterior: [],
    comfort: [],
    safety: [],
    door: '', // new start
    color: '',
    cylinder: '',
    length: '',
    width: '',
    trunkCapacity: '',
    tireSize: '',
    zeroToHundred: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  //   const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form options
  const fuelTypeOptions = [
    'gasoline',
    'diesel',
    'electric',
    'hybrid',
    'hydrogen',
  ];
  const transmissionOptions = ['manual', 'automatic', 'cvt', 'dual_clutch'];
  const bodyTypeOptions = [
    'sedan',
    'coupe',
    'hatchback',
    'suv',
    'crossover',
    'truck',
    'convertible',
    'wagon',
    'minivan',
    'sports_car',
    'luxury',
    'electric',
    'hybrid',
  ];
  const categoryOptions = [
    'luxury',
    'comfort',
    'sport',
    'suv',
    'budget',
    'pickup',
    'ev',
  ];
  const drivetrainOptions = ['fwd', 'rwd', 'awd', '4wd'];
  const conditionOptions = ['new', 'used', 'clean', 'accident free'];

  const [customFeatures, setCustomFeatures] = useState({
    interior: [],
    exterior: [],
    comfort: [],
    safety: [],
  });

  const [newFeature, setNewFeature] = useState({
    interior: '',
    exterior: '',
    comfort: '',
    safety: '',
  });

  const { isLoading, addCar, error } = useAdminOpsStore();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addCustomFeature = (category) => {
    if (newFeature[category].trim()) {
      setCustomFeatures((prev) => ({
        ...prev,
        [category]: [...prev[category], newFeature[category].trim()],
      }));
      setNewFeature((prev) => ({ ...prev, [category]: '' }));
    }
  };

  const removeFeature = (category, feature) => {
    setCustomFeatures((prev) => ({
      ...prev,
      [category]: prev[category].filter((f) => f !== feature),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

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
    try {
      const carData = {
        ...formData,
        images: images,
        interior: customFeatures.interior,
        exterior: customFeatures.exterior,
        comfort: customFeatures.comfort,
        safety: customFeatures.safety,
        price: parseFloat(formData.price),
        msrp: formData.msrp ? parseFloat(formData.msrp) : null,
        door: formData.door ? parseInt(formData.door) : null,
        cylinder: formData.cylinder ? parseInt(formData.cylinder) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        trunkCapacity: formData.trunkCapacity
          ? parseFloat(formData.trunkCapacity)
          : null,
        tireSize: formData.tireSize ? formData.tireSize : null,
        zeroToHundred: formData.zeroToHundred
          ? parseFloat(formData.zeroToHundred)
          : null,
        mileage: parseInt(formData.mileage),
        year: parseInt(formData.year),
        engineSize: formData.engineSize
          ? parseFloat(formData.engineSize)
          : null,
        horsepower: formData.horsepower ? parseInt(formData.horsepower) : null,
        torque: formData.torque ? parseInt(formData.torque) : null,
      };
      const success = addCar(carData);
      if (success.data) {
        setFormData({
          make: '',
          model: '',
          price: '',
          condition: '',
          msrp: '',
          mileage: '',
          fuelType: '',
          transmission: '',
          year: '',
          door: '',
          color: '',
          cylinder: '',
          length: '',
          width: '',
          trunkCapacity: '',
          tireSize: '',
          zeroToHundred: '',
          bodyType: '',
          category: '',
          engineSize: '',
          horsepower: '',
          torque: '',
          drivetrain: '',
          description: '',
          sold: false,
          interior: [],
          exterior: [],
          comfort: [],
          safety: [],
        });
        setCustomFeatures({
          interior: [],
          exterior: [],
          comfort: [],
          safety: [],
        });
        setImages([]);
        setImagePreview([]);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Error adding car:', error);
      alert('Failed to add car. Please try again.');
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Basic Info',
      fields: ['make', 'model', 'year', 'price', 'condition', 'category'],
    },
    {
      id: 2,
      title: 'Specifications',
      fields: ['fuelType', 'transmission', 'bodyType', 'mileage'],
    },
    {
      id: 3,
      title: 'Performance',
      fields: ['engineSize', 'horsepower', 'torque', 'drivetrain'],
    },
    {
      id: 4,
      title: 'Features',
      fields: ['interior', 'exterior', 'comfort', 'safety'],
    },
    {
      id: 5,
      title: 'Images & Details',
      fields: ['images', 'description', 'msrp'],
    },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label font-medium">Make *</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="e.g., Toyota"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="e.g., Camry"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="2024"
                  min="1900"
                  max="2030"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="25000"
                  step="0.01"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label font-medium">Condition *</label>
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
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label font-medium">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="select select-bordered w-full rounded-full"
                  required
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label font-medium">Fuel Type *</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="select select-bordered w-full rounded-full"
                  required
                >
                  <option value="">Select Fuel Type</option>
                  {fuelTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label font-medium">Transmission *</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="select select-bordered w-full rounded-full"
                  required
                >
                  <option value="">Select Transmission</option>
                  {transmissionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label font-medium">Body Type</label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleInputChange}
                  className="select select-bordered w-full rounded-full"
                >
                  <option value="">Select Body Type</option>
                  {bodyTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace('_', ' ').charAt(0).toUpperCase() +
                        option.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label font-medium">Mileage *</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="50000"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Doors *</label>
                <input
                  type="number"
                  name="door"
                  value={formData.door}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="4"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Color *</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="Midnight Blue"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Cylinder *</label>
                <input
                  type="number"
                  name="cylinder"
                  value={formData.cylinder}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="8"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Length *</label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="cm"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Width *</label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="cm"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Trunk Capacity *</label>
                <input
                  type="number"
                  name="trunkCapacity"
                  value={formData.trunkCapacity}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="in Liters"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Tire Size *</label>
                <input
                  type="text"
                  name="tireSize"
                  value={formData.tireSize}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="P215/60R16"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">0-100km/h *</label>
                <input
                  type="number"
                  name="zeroToHundred"
                  value={formData.zeroToHundred}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="in seconds"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label font-medium">Engine Size (L)</label>
                <input
                  type="number"
                  name="engineSize"
                  value={formData.engineSize}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="2.0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="label font-medium">Horsepower</label>
                <input
                  type="number"
                  name="horsepower"
                  value={formData.horsepower}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="label font-medium">Torque (lb-ft)</label>
                <input
                  type="number"
                  name="torque"
                  value={formData.torque}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="250"
                />
              </div>
              <div>
                <label className="label font-medium">Drivetrain</label>
                <select
                  name="drivetrain"
                  value={formData.drivetrain}
                  onChange={handleInputChange}
                  className="select select-bordered w-full rounded-full"
                >
                  <option value="">Select Drivetrain</option>
                  {drivetrainOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {Object.keys(customFeatures).map((category) => (
              <div key={category}>
                <label className="label font-medium capitalize">
                  {category} Features
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature[category]}
                      onChange={(e) =>
                        setNewFeature((prev) => ({
                          ...prev,
                          [category]: e.target.value,
                        }))
                      }
                      className="input input-bordered flex-1 rounded-full"
                      placeholder={`Add ${category} feature...`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomFeature(category);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addCustomFeature(category)}
                      className="btn btn-primary rounded-full px-6"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {customFeatures[category].length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customFeatures[category].map((feature, index) => (
                        <div
                          key={index}
                          className="badge badge-lg badge-outline gap-2 py-3 px-4 rounded-full"
                        >
                          <span>{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(category, feature)}
                            className="hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="label font-medium">Car Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-sm text-gray-600">
                    Click to upload images
                  </span>
                </label>
              </div>

              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreview.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label font-medium">MSRP (Optional)</label>
              <input
                type="number"
                name="msrp"
                value={formData.msrp}
                onChange={handleInputChange}
                className="input input-bordered w-full rounded-full"
                placeholder="30000"
                step="0.01"
              />
            </div>

            <div>
              <label className="label font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full h-32 rounded-3xl"
                placeholder="Describe the vehicle..."
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="sold"
                  checked={formData.sold}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary rounded-full"
                />
                <span>Mark as sold</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              className="btn btn-ghost rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Add New Car</h1>
              <p className="text-gray-600">
                Fill in the details to add a new car to inventory
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm font-medium">
              <span>Step {currentStep} of 5</span>
              <span>{steps[currentStep - 1]?.title}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/** error */}
          {error && <ErrorLogger error={error} />}

          {/* Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body" onSubmit={handleSubmit}>
              {renderStep()}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline rounded-full px-8"
                  disabled={currentStep === 1}
                >
                  Previous
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn btn-primary rounded-full px-8"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn btn-primary rounded-full px-8"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Adding Car...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Add Car
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCarPage;
