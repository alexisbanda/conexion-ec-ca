import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Testimonial } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import testimonialsData from '../testimonials.json';
import { regions } from './NationalRegionSelector';

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 })
};

interface TestimonialsProps {
    regionName: string;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ regionName }) => {
    const location = useLocation();
    const currentRegion = useMemo(() => regions.find(r => r.path === location.pathname), [location.pathname]);
    const regionId = useMemo(() => currentRegion?.id || 'default', [currentRegion]);

    const activeTestimonials = useMemo(() => {
        return testimonialsData[regionId as keyof typeof testimonialsData] || testimonialsData.default;
    }, [regionId]);

    const [[testimonialIndex, direction], setTestimonialState] = useState([0, 0]);

    const paginate = (newDirection: number) => {
        let newIndex = testimonialIndex + newDirection;
        if (newIndex < 0) newIndex = activeTestimonials.length - 1;
        else if (newIndex >= activeTestimonials.length) newIndex = 0;
        setTestimonialState([newIndex, newDirection]);
    };

    const setTestimonialIndex = (newIndex: number) => {
        const newDirection = newIndex > testimonialIndex ? 1 : -1;
        setTestimonialState([newIndex, newDirection]);
    }

    if (!activeTestimonials || activeTestimonials.length === 0) {
        return null; // No renderizar nada si no hay testimonios
    }

    const currentTestimonial = activeTestimonials[testimonialIndex];

    return (
        <div className="py-16 md:py-24 bg-ecuador-blue text-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }}>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Lo que Nuestra Comunidad Dice</h2>
                    <p className="text-lg text-blue-200 max-w-3xl mx-auto">Historias reales de miembros que han transformado su vida en {regionName} con nuestro apoyo.</p>
                </motion.div>
                <div className="relative h-[30rem] max-w-4xl mx-auto">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={testimonialIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, { offset }) => { Math.abs(offset.x) > 50 && paginate(offset.x > 0 ? -1 : 1); }}
                            className="absolute inset-0 bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl flex items-center justify-center"
                        >
                            <div className="text-center max-w-xl">
                                <img src={currentTestimonial.imageUrl} alt={currentTestimonial.author} className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-ecuador-yellow" />
                                <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6">"{currentTestimonial.quote}"</p>
                                <div>
                                    <p className="font-bold text-xl text-ecuador-yellow">{currentTestimonial.author}</p>
                                    <p className="text-blue-200">{currentTestimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                        <button
                            onClick={() => paginate(-1)}
                            className="bg-white/10 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 z-10 pointer-events-auto -translate-x-4 md:-translate-x-8 lg:-translate-x-16"
                            aria-label="Anterior testimonio"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => paginate(1)}
                            className="bg-white/10 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 z-10 pointer-events-auto translate-x-4 md:translate-x-8 lg:translate-x-16"
                            aria-label="Siguiente testimonio"
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="flex justify-center gap-3 mt-8">
                    {activeTestimonials.map((_, i) => (
                        <button key={i} onClick={() => setTestimonialIndex(i)} className={`w-3 h-3 rounded-full transition-all duration-300 ${testimonialIndex === i ? 'bg-ecuador-yellow scale-125' : 'bg-white/30 hover:bg-white/50'}`} aria-label={`Ir al testimonio ${i + 1}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};
