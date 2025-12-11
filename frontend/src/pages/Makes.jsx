import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowRight, ArrowUpRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import MakeCard from '../components/MakeCard';
import {
  audi1 as audi,
  benz,
  bmw1 as bmw,
  honda1 as honda,
  benz1 as mercedes,
  toyota1 as toyota,
} from '../config/images';

const Makes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const navigate = useNavigate();

  const selectMake = (make) => {
    navigate('/listings', { state: { make } });
  };

  const makes = [
    {
      name: 'Mercedes-Benz',
      slug: 'mercedes',
      src: mercedes,
      category: 'luxury',
      models: 45,
      description: 'Premium German engineering and luxury vehicles',
    },
    {
      name: 'BMW',
      slug: 'bmw',
      src: bmw,
      category: 'luxury',
      models: 38,
      description: 'The ultimate driving machine with performance focus',
    },
    {
      name: 'Audi',
      slug: 'audi',
      src: audi,
      category: 'luxury',
      models: 32,
      description: 'Innovative technology and sophisticated design',
    },
    {
      name: 'Toyota',
      slug: 'toyota',
      src: toyota,
      category: 'mainstream',
      models: 52,
      description: 'Reliable and efficient vehicles for everyone',
    },
    {
      name: 'Honda',
      slug: 'honda',
      src: honda,
      category: 'mainstream',
      models: 41,
      description: 'Quality engineering and fuel efficiency',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Makes' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'mainstream', label: 'Mainstream' },
  ];

  const filteredMakes = makes.filter((make) => {
    const matchesSearch = make.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || make.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-gray-50 to-white pt-26">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4 text-center"
        >
          {/* <div className="inline-block p-2 px-6 rounded-full border border-gray-300 mb-6">
            <span className="text-sm text-gray-800">Vehicle Makes</span>
          </div> */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6">
            Explore Our Top Makes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse through our carefully curated selection of premium and
            reliable vehicle manufacturers
          </p>
        </motion.div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full py-8 border-b border-gray-300">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96 rounded-full">
              <Search className="rounded-full absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                placeholder="Search makes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 items-center">
              {/* <Filter className="text-secondary size-5" /> */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Makes Grid */}
      <section className="w-full py-16">
        <div className="max-w-6xl mx-auto px-4">
          {filteredMakes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                No makes found matching your search
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {filteredMakes.map((make, index) => (
                <motion.button
                onClick={() => selectMake(make.slug)}
                  key={make.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  // onClick={() => handleMakeClick(make.slug)}
                  className=""
                >
                 <MakeCard label={make.name} img={make.src} />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 bg-secondary">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-4xl font-bold text-primary mb-2">5+</h3>
              <p className="text-white">Premium Makes</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-4xl font-bold text-primary mb-2">200+</h3>
              <p className="text-white">Vehicle Models</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-4xl font-bold text-primary mb-2">1000+</h3>
              <p className="text-white">Happy Customers</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Contact us and we'll help you find the perfect vehicle from any
            manufacturer
          </p>
          <button 
          onclick={() => navigate('/contact')}
          className="btn btn-lg btn-primary rounded-full text-white px-8 py-4 font-medium hover:bg-primary/90 transition inline-flex items-center gap-2">
            Contact Us
            {/* <ArrowRight className="size-5" /> */}
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default Makes;
