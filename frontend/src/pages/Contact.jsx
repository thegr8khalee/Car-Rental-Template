import React, { useState } from 'react';
import branding from '../config/branding';
import { motion } from 'framer-motion';

const Contact = () => {
  const [isFocusedMessage, setIsFocusedMessage] = useState(false);
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPhone, setIsFocusedPhone] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const contactInfo = branding.contact ?? {};
  const getPhoneDetails = (phone) => ({
    display: phone?.display || phone?.value || '',
    value: phone?.value || phone?.display || '',
  });

  const mainPhone = getPhoneDetails(contactInfo.phones?.main);
  const supportPhone = getPhoneDetails(contactInfo.phones?.support);
  const salesPhone = getPhoneDetails(contactInfo.phones?.sales);

  const address = contactInfo.address ?? {};
  const addressText =
    address.formatted ||
    [address.line1, address.line2, address.city, address.region, address.country]
      .filter(Boolean)
      .join(', ');

  const fallbackLocation = {
    latitude: 9.053328635799218,
    longitude: 7.475317593815377,
  };

  const location = {
    latitude:
      typeof contactInfo.location?.latitude === 'number'
        ? contactInfo.location.latitude
        : fallbackLocation.latitude,
    longitude:
      typeof contactInfo.location?.longitude === 'number'
        ? contactInfo.location.longitude
        : fallbackLocation.longitude,
  };

  const googleMapsApiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;
  const hasLocation =
    location.latitude !== null && location.longitude !== null;
  const googleMapsEmbedUrl =
    googleMapsApiKey && hasLocation
      ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${location.latitude},${location.longitude}&center=${location.latitude},${location.longitude}&zoom=17`
      : null;

  return (
    <div className=" pt-26 font-inter min-h-screen items-center justify-center">
      {/* <section className="w-full bg-secondary pt-16 px-4 h-16 sticky top-0 z-50"></section> */}
      <div className="min-h-screen w-full max-w-7xl mx-auto flex items-center justify-center flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="mb-2">
              We would love to hear from you! Whether you have questions about
              our cars, need assistance, or want to provide feedback, feel free
              to reach out.
            </p>
            <p className="mb-2">
              Email:{' '}
              <a
                href={`mailto:${branding.contact.emails.info}`}
                className="text-blue-500"
              >
                {branding.contact.emails.info}
              </a>
            </p>
            {mainPhone.display && (
              <p>
                Phone:{' '}
                <a href={`tel:${mainPhone.value}`}>{mainPhone.display}</a>
              </p>
            )}
            {addressText && (
              <p className="mb-2">Address: {addressText}</p>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white shadow-xl rounded-none h-full w-full p-4 items-center justify-center"
          >
            <h1 className="font-inter text-2xl font-bold mt-2">
              Send Us a Message
            </h1>
            <p className="text-xs font-inter mt-1">
              Use this form to send us a message. We'll get back to you as soon
              as possible.
            </p>
            <form action="" className="my-2">
              <div className="relative w-full mb-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onFocus={() => setIsFocusedName(true)}
                  onBlur={() => setIsFocusedName(false)}
                  className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder=" " // Floating label trick
                  required
                />
                <label
                  className={`absolute left-3 transition-all duration-300
      ${
        isFocusedName || formData.name
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-4 text-lg'
      }
    `}
                >
                  Name Surname
                </label>
                <p className="validator-hint hidden">
                  Enter a valid email address
                </p>
              </div>
              <div className="flex space-x-2 mt-2">
                <div className="relative w-full mb-4">
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    onFocus={() => setIsFocusedEmail(true)}
                    onBlur={() => setIsFocusedEmail(false)}
                    className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder=" " // Floating label trick
                    required
                  />
                  <label
                    className={`absolute left-3 transition-all duration-300
      ${
        isFocusedEmail || formData.email
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-4 text-lg'
      }
    `}
                  >
                    Email Address
                  </label>
                  <p className="validator-hint hidden">
                    Enter a valid email address
                  </p>
                </div>
                <div className="relative w-full mb-4">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    onFocus={() => setIsFocusedPhone(true)}
                    onBlur={() => setIsFocusedPhone(false)}
                    className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder=" " // Floating label trick
                    required
                  />
                  <label
                    className={`absolute left-3 transition-all duration-300
      ${
        isFocusedPhone || formData.phone
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-4 text-lg'
      }
    `}
                  >
                    Phone Number
                  </label>
                  <p className="validator-hint hidden">
                    Enter a valid Phone Number
                  </p>
                </div>
              </div>
              <div className="relative w-full mb-4">
                <textarea
                  type="text"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  onFocus={() => setIsFocusedMessage(true)}
                  onBlur={() => setIsFocusedMessage(false)}
                  className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder=" " // Floating label trick
                  required
                />
                <label
                  className={`absolute left-3 transition-all duration-300
      ${
        isFocusedMessage || formData.message
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-4 text-lg'
      }
    `}
                >
                  Your Message
                </label>
              </div>
              <button className="w-full btn mt-2 text-white btn-primary btn-lg rounded-none">
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
        >
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-4">Our Location</h1>
            {addressText && (
              <p className="mb-2">
                Visit us at our dealership! We're located at {addressText}. Our
                friendly team is ready to assist you with all your car needs.
              </p>
            )}
            <h3>Opening Hours</h3>
            <ul className="list-disc list-inside">
              {contactInfo.hours?.length
                ? contactInfo.hours.map((entry) => (
                    <li key={`${entry.label}-${entry.value}`}>
                      {entry.label}
                      {entry.label && entry.value ? ': ' : ''}
                      {entry.value}
                    </li>
                  ))
                : (
                    <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                  )}
            </ul>
          </div>
          <div className="bg-base-100 p-2 rounded-none shadow-xl flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold font-inter mb-6">
              Find Us on the Map
            </h2>
            <div className="w-full h-80 rounded-none overflow-hidden border border-base-300">
              {googleMapsEmbedUrl ? (
                <iframe
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Our Showroom Location"
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-error">
                  <p>
                    Map unavailable. Confirm your Google Maps API key and
                    showroom coordinates in the branding config.
                  </p>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Click on the map for directions.
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full max-w-7xl"
        >
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold font-inter mb-2">
              Support
            </h2>
            <p>If you need assistance, please contact our support team.</p>
            <p>
              Email:{' '}
              <a href={`mailto:${branding.contact.emails.support}`}>
                {branding.contact.emails.support}
              </a>
            </p>
            {supportPhone.display && (
              <p>
                Phone:{' '}
                <a href={`tel:${supportPhone.value}`}>{supportPhone.display}</a>
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold font-inter mb-2">
              Sales Inquiries
            </h2>
            <p>
              If you're interested in purchasing a vehicle, please contact our
              sales team.
            </p>
            <p>
              Email:{' '}
              <a href={`mailto:${branding.contact.emails.sales}`}>
                {branding.contact.emails.sales}
              </a>
            </p>
            {salesPhone.display && (
              <p>
                Phone:{' '}
                <a href={`tel:${salesPhone.value}`}>{salesPhone.display}</a>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
