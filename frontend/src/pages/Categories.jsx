import React from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { motion } from 'framer-motion';
import {
  luxury,
  comfort,
  sport1 as sport,
  suv1 as suv,
  pickup1 as pickup,
  ev,
  budget, // Using sedan as a placeholder for budget
} from '../config/images';

const Categories = () => {
  const navigate = useNavigate();

  const selectCategory = (category) => {
    navigate('/listings', { state: { category } });
  };

  const categories = [
    {
      name: 'Luxury',
      slug: 'luxury',
      src: luxury,
      description: 'Premium vehicles with the finest features',
    },
    {
      name: 'Comfort',
      slug: 'comfort',
      src: comfort,
      description: 'Smooth rides and spacious interiors',
    },
    {
      name: 'Sport',
      slug: 'sport',
      src: sport,
      description: 'High-performance cars for an exhilarating drive',
    },
    {
      name: 'SUV',
      slug: 'suv',
      src: suv,
      description: 'Versatile and spacious for any adventure',
    },
    {
      name: 'Pickup',
      slug: 'pickup',
      src: pickup,
      description: 'Rugged trucks for work and play',
    },
    {
      name: 'Budget',
      slug: 'budget',
      src: budget,
      description: 'Affordable and reliable cars',
    },
    {
      name: 'EV',
      slug: 'ev',
      src: ev,
      description: 'Eco-friendly electric vehicles',
    },
  ];

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6">
            Explore Our Car Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect vehicle that fits your lifestyle from our diverse
            range of categories.
          </p>
        </motion.div>
      </section>

      {/* Categories Grid */}
      <section className="w-full py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.button
                onClick={() => selectCategory(category.slug)}
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className=""
              >
                <CategoryCard label={category.name} img={category.src} />
              </motion.button>
            ))}
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
            Ready to Find Your Next Car?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Browse our full inventory and filter by your favorite category.
          </p>
          <button
            onClick={() => navigate('/listings')}
            className="btn btn-lg btn-primary rounded-full text-white px-8 py-4 font-medium hover:bg-primary/90 transition inline-flex items-center gap-2"
          >
            View All Listings
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default Categories;
