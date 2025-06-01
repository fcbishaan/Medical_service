import React, { useState, useEffect } from 'react';
import Star from '../components/Star';

const HomePage = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/reviews/approved');
        const data = await response.json();
        if (data.success) {
          setTestimonials(data.data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <div>
      {/* 💬 Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Patients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{testimonial.patient?.name || 'Anonymous Patient'}</h3>
                    <p className="text-sm text-gray-600">About Dr. {testimonial.doctor?.name || 'Unknown Doctor'}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{testimonial.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 