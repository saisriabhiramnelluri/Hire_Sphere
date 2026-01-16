/**
 * Home Page
 * Public landing page with hero, features, stats, and footer
 * Enhanced with GSAP animations for premium user experience
 */
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    IoArrowForward,
    IoSchool,
    IoBusinessOutline,
    IoStatsChart
} from 'react-icons/io5';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const cursorRef = useRef(null);

    const features = [
        {
            icon: <IoSchool size={32} />,
            title: 'For Students',
            description: 'Browse placement drives, apply with your resumes, track application status, and receive offer letters.',
        },
        {
            icon: <IoBusinessOutline size={32} />,
            title: 'For Recruiters',
            description: 'Create placement drives, review applications, manage hiring pipeline, and send offer letters.',
        },
        {
            icon: <IoStatsChart size={32} />,
            title: 'For Administrators',
            description: 'Manage users, approve drives, view analytics, and oversee the entire placement process.',
        },
    ];

    const stats = [
        { value: 500, label: 'Students Placed', suffix: '+' },
        { value: 100, label: 'Partner Companies', suffix: '+' },
        { value: 95, label: 'Placement Rate', suffix: '%' },
        { value: 12, label: 'Average Package', suffix: ' LPA' },
    ];

    const steps = [
        { step: '1', title: 'Create Account', description: 'Register as a student or recruiter to get started' },
        { step: '2', title: 'Complete Profile', description: 'Add your details, skills, and upload your resume' },
        { step: '3', title: 'Apply to Drives', description: 'Browse available drives and submit applications' },
        { step: '4', title: 'Get Placed', description: 'Track your progress and receive offer letters' },
    ];

    useGSAP(() => {
        // Hero Animations
        const tl = gsap.timeline();

        tl.fromTo('.hero-badge',
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        )
            .fromTo('.hero-title span',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power4.out' }, '-=0.4'
            )
            .fromTo('.hero-desc',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.6'
            )
            .fromTo('.hero-btn',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' }, '-=0.4'
            );

        // Background Parallax
        gsap.to('.hero-bg-pattern', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 100,
            opacity: 0.1
        });

        // Stats Counter Animation
        stats.forEach((stat, i) => {
            ScrollTrigger.create({
                trigger: '.stats-container',
                start: 'top 90%',
                scrub: 1,
                end: 'top 60%',
                onEnter: () => {
                    gsap.fromTo(`.stat-item-${i}`,
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: 'power2.out' }
                    );

                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: stat.value,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: () => {
                            const el = document.querySelector(`.stat-val-${i}`);
                            if (el) el.innerText = Math.floor(obj.val) + stat.suffix;
                        }
                    });
                },
                onLeaveBack: () => {
                    gsap.set(`.stat-item-${i}`, { opacity: 0, y: 30 });
                    const el = document.querySelector(`.stat-val-${i}`);
                    if (el) el.innerText = '0' + stat.suffix;
                }
            });
        });

        // Features Stagger
        gsap.fromTo('.feature-card',
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.features-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // How It Works Steps
        gsap.fromTo('.step-item',
            { scale: 0.9, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: 'back.out(1.2)',
                scrollTrigger: {
                    trigger: '.steps-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Connection Line Animation
        gsap.fromTo('.step-line',
            { scaleX: 0 },
            {
                scaleX: 1,
                duration: 1.5,
                ease: 'power2.inOut',
                transformOrigin: 'left center',
                scrollTrigger: {
                    trigger: '.steps-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // CTA Parallax
        gsap.fromTo('.cta-content',
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.cta-section',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen overflow-x-hidden">
            {/* Hero Section */}
            <section ref={heroRef} className="hero-section relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white min-h-screen flex items-center">
                <div className="hero-bg-pattern absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative z-10 w-full">
                    <div className="max-w-4xl mx-auto text-center">
                        <div>
                            <span className="hero-badge inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary-500/20 text-secondary-300 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-secondary-500/30 backdrop-blur-sm">
                                Campus Placement Portal
                            </span>
                            <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight">
                                <span className="inline-block">Your Gateway to</span>{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-secondary-200 inline-block">Dream Career</span>
                            </h1>
                            <p className="hero-desc text-base sm:text-lg md:text-xl text-primary-200 mb-8 sm:mb-12 max-w-2xl mx-auto px-2 leading-relaxed">
                                Connect students with top recruiters, streamline placement drives, and land your dream job with HireSphere's automated ecosystem.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
                                <Link to="/register" className="w-full sm:w-auto hero-btn">
                                    <button className="w-full sm:w-auto px-8 py-4 bg-secondary-500 hover:bg-secondary-600 text-white font-bold rounded-xl shadow-lg shadow-secondary-500/30 flex items-center justify-center gap-2 transform transition-transform hover:-translate-y-1 hover:shadow-2xl">
                                        Get Started <IoArrowForward />
                                    </button>
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto hero-btn">
                                    <button className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 transform transition-transform hover:-translate-y-1">
                                        Sign In
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
            </section>

            {/* Stats Section */}
            <section className="py-12 sm:py-16 bg-white relative z-20 -mt-10 sm:-mt-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="stats-container bg-white rounded-2xl shadow-2xl shadow-primary-900/10 p-6 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-8 border border-primary-50">
                        {stats.map((stat, index) => (
                            <div key={index} className={`stat-item-${index} text-center group hover:bg-primary-50 p-4 rounded-xl transition-colors`}>
                                <p className={`stat-val-${index} text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-secondary-600 to-secondary-800 mb-2`}>
                                    0{stat.suffix}
                                </p>
                                <p className="text-sm sm:text-base text-primary-600 font-medium tracking-wide uppercase">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 sm:py-20 bg-primary-50">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10 sm:mb-12">
                        <span className="text-secondary-600 font-semibold tracking-wider text-sm uppercase mb-3 block">Features</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 mb-4">One Platform, Multiple Roles</h2>
                        <div className="w-20 h-1.5 bg-secondary-500 mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card group bg-white p-8 rounded-3xl shadow-lg border border-primary-100 hover:border-secondary-200 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>

                                <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-secondary-500/20 group-hover:scale-110 transition-transform duration-300 relative z-10">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-primary-900 mb-4 relative z-10">{feature.title}</h3>
                                <p className="text-primary-600 leading-relaxed relative z-10">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 sm:py-20 bg-white overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10 sm:mb-12">
                        <span className="text-secondary-600 font-semibold tracking-wider text-sm uppercase mb-3 block">Walkthrough</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 mb-4">How It Works</h2>
                        <div className="w-20 h-1.5 bg-secondary-500 mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="steps-grid grid grid-cols-2 md:grid-cols-4 gap-8">
                        {steps.map((item, index) => (
                            <div key={index} className="step-item text-center relative">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 border-primary-100 text-primary-900 text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm relative z-10 group hover:border-secondary-500 hover:text-secondary-600 transition-colors duration-300">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-primary-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-primary-600 px-2">{item.description}</p>

                                {index < steps.length - 1 && (
                                    <div className="step-line hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-primary-100"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section py-16 sm:py-20 bg-primary-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary-500 via-primary-900 to-primary-950"></div>

                <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
                    <div className="cta-content max-w-4xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Ready to Start Your Journey?</h2>
                        <p className="text-lg md:text-xl text-primary-200 mb-10 max-w-2xl mx-auto">
                            Join thousands of students and recruiters already optimizing their placement process with HireSphere.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
                            <Link to="/register" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-8 py-4 bg-secondary-500 hover:bg-secondary-400 text-white font-bold rounded-xl shadow-xl shadow-secondary-900/50 flex items-center justify-center gap-2 transform transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-secondary-500/20">
                                    Create Free Account <IoArrowForward />
                                </button>
                            </Link>
                            <Link to="/contact" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-semibold rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/40 transform transition-all hover:-translate-y-1">
                                    Contact Sales
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-primary-950 text-white py-12 border-t border-primary-800">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">
                                <span className="text-secondary-500">Hire</span>Sphere
                            </h3>
                            <p className="text-primary-400 text-sm leading-relaxed max-w-xs">
                                Connecting talent with opportunity through seamless, automated campus placements.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-6 text-white tracking-wide uppercase text-sm">Quick Links</h4>
                            <ul className="space-y-3 text-primary-400 text-sm">
                                <li><Link to="/about" className="hover:text-secondary-400 transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-secondary-400 transition-colors">Contact</Link></li>
                                <li><Link to="/faq" className="hover:text-secondary-400 transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-6 text-white tracking-wide uppercase text-sm">Legal</h4>
                            <ul className="space-y-3 text-primary-400 text-sm">
                                <li><Link to="/privacy" className="hover:text-secondary-400 transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-secondary-400 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-6 text-white tracking-wide uppercase text-sm">Get Started</h4>
                            <ul className="space-y-3 text-primary-400 text-sm">
                                <li><Link to="/login" className="hover:text-secondary-400 transition-colors">Sign In</Link></li>
                                <li><Link to="/register" className="hover:text-secondary-400 transition-colors flex items-center gap-2">Register <span className="w-2 h-2 rounded-full bg-secondary-500"></span></Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-primary-900 pt-8 text-center text-primary-500 text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p>&copy; {new Date().getFullYear()} HireSphere. All rights reserved.</p>
                        <div className="flex gap-4">
                            {/* Social icons could go here */}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;

