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
            icon: <IoSchool size={40} />,
            title: 'For Students',
            description: 'Browse placement drives, apply with your resumes, track application status, and receive offer letters.',
        },
        {
            icon: <IoBusinessOutline size={40} />,
            title: 'For Recruiters',
            description: 'Create placement drives, review applications, manage hiring pipeline, and send offer letters.',
        },
        {
            icon: <IoStatsChart size={40} />,
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
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="container mx-auto px-6 py-24 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-4 py-2 bg-secondary-500/20 text-secondary-300 rounded-full text-sm font-medium mb-6">
                                🎓 Campus Placement Portal
                            </span>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                Your Gateway to
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-secondary-300"> Dream Career</span>
                            </h1>
                            <p className="text-xl text-primary-200 mb-10 max-w-2xl mx-auto">
                                Connect students with top recruiters, streamline placement drives, and land your dream job with HireSphere.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-xl shadow-lg shadow-secondary-500/30 flex items-center justify-center gap-2"
                                    >
                                        Get Started <IoArrowForward />
                                    </motion.button>
                                </Link>
                                <Link to="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-xl border border-white/20"
                                    >
                                        Sign In
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white -mt-12 relative z-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <p className="text-4xl font-bold text-secondary-600 mb-2">{stat.value}</p>
                                <p className="text-primary-600">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-primary-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-primary-900 mb-4">One Platform, Multiple Roles</h2>
                        <p className="text-xl text-primary-600 max-w-2xl mx-auto">
                            HireSphere caters to everyone involved in the placement process
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-primary-900 mb-3">{feature.title}</h3>
                                <p className="text-primary-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-primary-900 mb-4">How It Works</h2>
                        <p className="text-xl text-primary-600 max-w-2xl mx-auto">
                            Get started in just a few simple steps
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center relative"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-800 to-primary-900 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-primary-900 mb-2">{item.title}</h3>
                                <p className="text-primary-600">{item.description}</p>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-transparent"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-secondary-600 to-secondary-700">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
                        <p className="text-xl text-secondary-100 mb-10 max-w-2xl mx-auto">
                            Join thousands of students and recruiters already using HireSphere
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white text-secondary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    Create Free Account <IoArrowForward />
                                </motion.button>
                            </Link>
                            <Link to="/contact">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10"
                                >
                                    Contact Us
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-primary-900 text-white py-16">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">
                                <span className="text-secondary-400">Hire</span>Sphere
                            </h3>
                            <p className="text-primary-300">
                                Connecting talent with opportunity through seamless campus placements.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-primary-300">
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-primary-300">
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Get Started</h4>
                            <ul className="space-y-2 text-primary-300">
                                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-primary-700 pt-8 text-center text-primary-400">
                        <p>&copy; {new Date().getFullYear()} HireSphere. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
