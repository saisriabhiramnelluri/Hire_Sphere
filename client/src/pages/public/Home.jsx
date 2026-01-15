/**
 * Home Page
 * Public landing page with hero, features, stats, and footer
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoArrowForward,
    IoSchool,
    IoBusinessOutline,
    IoStatsChart
} from 'react-icons/io5';

const Home = () => {
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
        { value: '500+', label: 'Students Placed' },
        { value: '100+', label: 'Partner Companies' },
        { value: '95%', label: 'Placement Rate' },
        { value: '12 LPA', label: 'Average Package' },
    ];

    const steps = [
        { step: '1', title: 'Create Account', description: 'Register as a student or recruiter to get started' },
        { step: '2', title: 'Complete Profile', description: 'Add your details, skills, and upload your resume' },
        { step: '3', title: 'Apply to Drives', description: 'Browse available drives and submit applications' },
        { step: '4', title: 'Get Placed', description: 'Track your progress and receive offer letters' },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white min-h-screen flex items-center">
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative z-10 w-full">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary-500/20 text-secondary-300 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                                Campus Placement Portal
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                                Your Gateway to
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-secondary-300"> Dream Career</span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-primary-200 mb-6 sm:mb-10 max-w-2xl mx-auto px-2">
                                Connect students with top recruiters, streamline placement drives, and land your dream job with HireSphere.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                                <Link to="/register" className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-xl shadow-lg shadow-secondary-500/30 flex items-center justify-center gap-2"
                                    >
                                        Get Started <IoArrowForward />
                                    </motion.button>
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-xl border border-white/20"
                                    >
                                        Sign In
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-white to-transparent"></div>
            </section>

            {/* Stats Section */}
            <section className="py-8 sm:py-12 md:py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary-600 mb-1 sm:mb-2">{stat.value}</p>
                                <p className="text-xs sm:text-sm md:text-base text-primary-600">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-16 md:py-20 bg-primary-50">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        className="text-center mb-8 sm:mb-12 md:mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-900 mb-3 sm:mb-4">One Platform, Multiple Roles</h2>
                        <p className="text-base sm:text-lg md:text-xl text-primary-600 max-w-2xl mx-auto px-2">
                            HireSphere caters to everyone involved in the placement process
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-900 mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-primary-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-12 sm:py-16 md:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        className="text-center mb-8 sm:mb-12 md:mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-900 mb-3 sm:mb-4">How It Works</h2>
                        <p className="text-base sm:text-lg md:text-xl text-primary-600 max-w-2xl mx-auto px-2">
                            Get started in just a few simple steps
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {steps.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center relative"
                            >
                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary-800 to-primary-900 text-white text-lg sm:text-xl md:text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                                    {item.step}
                                </div>
                                <h3 className="text-sm sm:text-base md:text-xl font-bold text-primary-900 mb-1 sm:mb-2">{item.title}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-primary-600">{item.description}</p>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-transparent"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-secondary-600 to-secondary-700">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Start Your Journey?</h2>
                        <p className="text-base sm:text-lg md:text-xl text-secondary-100 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2">
                            Join thousands of students and recruiters already using HireSphere
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                            <Link to="/register" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-secondary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    Create Free Account <IoArrowForward />
                                </motion.button>
                            </Link>
                            <Link to="/contact" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10"
                                >
                                    Contact Us
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-primary-900 text-white py-10 sm:py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                                <span className="text-secondary-400">Hire</span>Sphere
                            </h3>
                            <p className="text-sm sm:text-base text-primary-300">
                                Connecting talent with opportunity through seamless campus placements.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
                            <ul className="space-y-1.5 sm:space-y-2 text-primary-300 text-sm">
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Legal</h4>
                            <ul className="space-y-1.5 sm:space-y-2 text-primary-300 text-sm">
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Get Started</h4>
                            <ul className="space-y-1.5 sm:space-y-2 text-primary-300 text-sm">
                                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-primary-700 pt-6 sm:pt-8 text-center text-primary-400 text-xs sm:text-sm">
                        <p>&copy; {new Date().getFullYear()} HireSphere. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;

