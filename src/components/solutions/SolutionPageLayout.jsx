
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PlaceholderAnimation from '../shared/PlaceholderAnimation';
import DualCTABlock from '../shared/DualCTABlock';
import { CheckCircle, Quote } from 'lucide-react';

export default function SolutionPageLayout({ service }) {
    if (!service) {
        return <div>Loading service details...</div>;
    }

    const {
        title,
        h2,
        descriptivePhrase,
        overview,
        image,
        outcomes = [],
        testimonials = [],
        cta_label = 'Book a Strategy Session',
        cta_link = 'book-strategy-session'
    } = service;

    return (
        <div className="text-white">
            {/* Hero Section */}
            <section className="py-24 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-gray-900/90 backdrop-blur-md rounded-3xl p-8 border border-gray-700"
                        >
                            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-white">{title}</h1>
                            {h2 && <p className="text-2xl text-gray-100">{h2}</p>}
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="flex gap-4 justify-center">
                                <PlaceholderAnimation type="funnel" />
                                <PlaceholderAnimation type="fingers" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Content Layout */}
            <section className="py-20 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                            className="bg-gray-900/90 backdrop-blur-md rounded-3xl p-8 border border-gray-700"
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">{descriptivePhrase}</h2>
                            <p className="text-lg text-gray-100 leading-relaxed mb-8">{overview}</p>
                            <Button asChild size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold">
                                <Link to={createPageUrl(cta_link)}>{cta_label}</Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                        >
                            <img 
                                src={image} 
                                alt={title} 
                                className="w-full h-auto object-cover rounded-3xl shadow-2xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
            
            {/* Outcomes */}
            {outcomes.length > 0 && (
                <section className="py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold mb-12 text-white">Expected Outcomes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {outcomes.map((outcome, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-gray-900/90 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-gray-700"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <CheckCircle className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                                    <h3 className="font-bold text-lg mb-2 text-white">{outcome.title}</h3>
                                    <p className="text-gray-100 text-sm">{outcome.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <section className="py-16 sm:py-24 bg-gray-900/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Client Success Stories</h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                See the real-world impact of our solutions.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8"
                                >
                                    <Quote className="w-10 h-10 text-yellow-400/30 mb-4" />
                                    <blockquote className="text-gray-200 leading-relaxed mb-6">
                                        "{testimonial.quote}"
                                    </blockquote>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{testimonial.name}</h3>
                                            {testimonial.company && <p className="text-sm text-gray-400">{testimonial.company}</p>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="relative bg-gray-800 text-white py-20">
                <DualCTABlock
                    title="Ready to implement this solution?"
                    cta1_text={cta_label}
                    cta1_link={cta_link}
                    cta2_text="See Other Solutions"
                    cta2_link="solutions"
                />
            </section>
        </div>
    );
}
