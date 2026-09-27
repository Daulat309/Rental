import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const slides = [
        {
            image: "/hero-bg.png",
            headline: "Rent What You Need.",
            headlineAccent: "Share What You Own.",
            description: "A simple peer-to-peer rental marketplace. Find items near you or list your own to earn. Verified users, secure messaging, flexible terms.",
            cta: "Browse Rentals",
            ctaAction: () => {
                const el = document.getElementById('categories');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
        },
        {
            image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=1992",
            headline: "Find What You Need.",
            headlineAccent: "Skip the Purchase.",
            description: "From electronics to furniture, rent items for as long as you need. No commitment, no clutter, just convenience.",
            cta: "Explore Categories",
            ctaAction: () => {
                const el = document.getElementById('categories');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
        },
        {
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=2070",
            headline: "Turn Idle Items",
            headlineAccent: "Into Extra Income.",
            description: "List your unused items and earn while helping others. Set your own prices and availability.",
            cta: "Start Listing",
            ctaAction: () => navigate('/rental')
        }
    ];

    const goToSlide = (index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 600);
    };

    const nextSlide = () => {
        goToSlide((currentSlide + 1) % slides.length);
    };

    const prevSlide = () => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 7000);
        return () => clearInterval(timer);
    }, [currentSlide]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const currentSlideData = slides[currentSlide];

    return (
        <section className="relative w-full h-[92vh] min-h-[600px] max-h-[900px] overflow-hidden bg-gray-900">
            {/* Background Images */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'
                    }`}
                >
                    <img
                        src={slide.image}
                        alt=""
                        className="w-full h-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                    />
                </div>
            ))}

            {/* Overlay - gradient from left for text readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/30"></div>

            {/* Content Container */}
            <div className="relative z-20 h-full flex items-center">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-xl">
                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-5">
                            {currentSlideData.headline}
                            <br />
                            <span className="text-[#5BC0EB]">{currentSlideData.headlineAccent}</span>
                        </h1>

                        {/* Description */}
                        <p className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed max-w-md">
                            {currentSlideData.description}
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-lg mb-8">
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                                    <Search className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search items to rent near you..."
                                        className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400 text-base"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#1399c6] hover:bg-[#1171ba] text-white rounded-xl px-6 py-3.5 font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg"
                                >
                                    Search
                                    <ArrowRight size={18} />
                                </button>
                            </form>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={currentSlideData.ctaAction}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 flex items-center gap-2"
                            >
                                {currentSlideData.cta}
                                <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => navigate('/rental')}
                                className="text-white/80 hover:text-white font-medium transition-colors flex items-center gap-2 group"
                            >
                                List an Item
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute left-6 lg:left-12 bottom-8 z-30 flex items-center gap-3">
                <button
                    onClick={prevSlide}
                    disabled={isTransitioning}
                    className="w-11 h-11 rounded-full border border-white/40 hover:border-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center group disabled:opacity-50"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={20} className="text-white/80 group-hover:text-white" />
                </button>
                <button
                    onClick={nextSlide}
                    disabled={isTransitioning}
                    className="w-11 h-11 rounded-full border border-white/40 hover:border-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center group disabled:opacity-50"
                    aria-label="Next slide"
                >
                    <ChevronRight size={20} className="text-white/80 group-hover:text-white" />
                </button>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        disabled={isTransitioning}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide 
                                ? 'w-8 bg-[#5BC0EB]' 
                                : 'w-2 bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Slide Counter */}
            <div className="absolute right-6 lg:right-12 bottom-8 z-30 text-white/60 text-sm font-medium">
                <span className="text-white">{String(currentSlide + 1).padStart(2, '0')}</span>
                <span className="mx-1">/</span>
                <span>{String(slides.length).padStart(2, '0')}</span>
            </div>
        </section>
    );
};

export default Hero;
