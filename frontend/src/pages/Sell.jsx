import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  Phone,
  MapPin,
  ChevronDown,
  ArrowRight,
  DollarSign,
  Clock,
  Shield,
  FileText,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LearnMoreSell = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'Do I need to bring documents?',
      answer:
        "Yes. You'll need your car's proof of ownership, valid ID, and any service history (if available).",
    },
    {
      question: 'What if my car is not in perfect condition?',
      answer:
        "No problem! We buy cars in all conditions. Just be honest about the details and we'll still give you a fair offer.",
    },
    {
      question: 'How long does the process take?',
      answer: 'Usually less than 1 hour once you arrive at our showroom.',
    },
    {
      question: 'Do you buy cars with outstanding loans?',
      answer:
        'Yes, we can work with you to settle outstanding loans as part of the purchase process.',
    },
    {
      question: 'What payment methods do you offer?',
      answer:
        'We offer instant bank transfer or cash payment on the same day you accept our offer.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Get a Free Valuation',
      description:
        'Tell us a few details about your car — make, model, year, mileage, and condition. Our system and experts will provide an instant, fair market value.',
      icon: DollarSign,
    },
    {
      number: '2',
      title: 'Book an Appointment',
      description:
        'Bring your car to our showroom for a quick inspection. No hidden fees, no endless negotiations — just a straightforward assessment.',
      icon: Clock,
    },
    {
      number: '3',
      title: 'Sell & Get Paid Instantly',
      description:
        "If you accept our offer, we'll handle the paperwork and pay you on the spot. Walk in with your car, drive out with cash (or transfer) the same day.",
      icon: Shield,
    },
  ];

  const navigate = useNavigate();
  const handleSell = () => {
    navigate('/sell/form');
  };

  const benefits = [
    "Nigeria's largest and most trusted car dealership",
    'Thousands of satisfied customers nationwide',
    'Quick, transparent, and hassle-free process',
    'Same-day payment',
    'No middlemen — deal directly with professionals',
  ];

  return (
    <div className="bg-base-200">
      {/* Mobile View */}
      <div id="mobile-view" className="sm:hidden">
        <section className="w-full sticky top-0 bg-secondary pt-16 px-4 h-16 z-50">
          <hr className="border-t border-gray-500" />
        </section>
        {/* Hero Section */}
        <section className="pt-16 bg-secondary py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-white text-3xl font-bold font-inter mb-4">
              How to Sell Your Car with Ease
            </h1>
            <p className="text-gray-200 text-sm font-inter">
              At [Dealership Name], we believe selling your car should be fast,
              transparent, and stress-free.
            </p>
          </motion.div>
        </section>

        {/* Steps Section */}
        <section className="px-4 py-8">
          <h2 className="text-2xl font-bold font-inter mb-6 text-center">
            Three Easy Steps
          </h2>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold font-inter mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-8 px-4">
          <h2 className="text-2xl font-bold font-inter mb-6 text-center">
            Why Choose Us?
          </h2>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <Check className="text-primary flex-shrink-0 mt-1" size={20} />
                <p className="text-gray-700">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-8 px-4">
          <h2 className="text-2xl font-bold font-inter mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 flex justify-between items-center text-left"
                >
                  <h3 className="font-semibold font-inter">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`transform transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary/70 py-12 px-4">
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold font-inter mb-6">
              Ready to Sell?
            </h2>
            <div className="space-y-4">
              <a
                href="tel:+2348001234567"
                className="flex items-center justify-center space-x-2 text-white"
              >
                <Phone size={20} />
                <span>+234 800 123 4567</span>
              </a>
              <a
                href="#"
                className="flex items-center justify-center space-x-2 text-white"
              >
                <MapPin size={20} />
                <span>123 Main Street, Garki, Abuja</span>
              </a>
              <button
                onClick={handleSell}
                className="w-full btn btn-primary btn-lg rounded-full font-medium mt-6"
              >
                Sell My Car Now
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Desktop View */}
      <div id="desktop-view" className="hidden sm:block">
        <section className="w-full sticky top-0 bg-secondary pt-16 px-4 h-16 z-50">
          <hr className="border-t border-gray-500" />
        </section>
        {/* Hero Section */}
        <section className="bg-secondary py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-white text-5xl md:text-6xl font-bold font-inter mb-6">
                How to Sell Your Car with Ease
              </h1>
              <p className="text-gray-200 text-lg font-inter max-w-3xl mx-auto">
                At [Dealership Name], we believe selling your car should be
                fast, transparent, and stress-free. That's why we've simplified
                the process into three easy steps.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold font-inter mb-12 text-center">
              Three Easy Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold font-inter mb-4 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold font-inter mb-12 text-center">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start space-x-4 bg-base-200 p-6 rounded-xl"
                >
                  <Check
                    className="text-primary flex-shrink-0 mt-1"
                    size={24}
                  />
                  <p className="text-gray-700 text-lg">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold font-inter mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold font-inter text-lg">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`transform transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                      size={24}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary/70 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-white text-4xl font-bold font-inter mb-8">
              Ready to Sell?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <a
                href="tel:+2348001234567"
                className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors"
              >
                <Phone size={24} className="text-primary" />
                <div className="text-left">
                  <p className="text-gray-300 text-sm">Call us now</p>
                  <p className="text-white font-semibold text-lg">
                    +234 800 123 4567
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors"
              >
                <MapPin size={24} className="text-primary" />
                <div className="text-left">
                  <p className="text-gray-300 text-sm">Visit our showroom</p>
                  <p className="text-white font-semibold text-lg">
                    123 Main Street, Garki, Abuja
                  </p>
                </div>
              </a>
            </div>
            <button
              onClick={handleSell}
              className="btn btn-primary btn-lg rounded-full font-medium text-lg px-12"
            >
              Sell My Car Now
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LearnMoreSell;
