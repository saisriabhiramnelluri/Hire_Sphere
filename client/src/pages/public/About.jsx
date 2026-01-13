import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    IoRocket,
    IoPeople,
    IoHeart,
    IoTrophy,
    IoArrowBack,
    IoCheckmarkCircle
} from 'react-icons/io5';

const About = () => {
    const values = [
        {
            icon: <IoRocket size={32} />,
            title: 'Innovation',
            description: 'We continuously innovate to make placements smoother and more efficient.',
        },
        {
            icon: <IoPeople size={32} />,
            title: 'Collaboration',
            description: 'We bring students, recruiters, and institutions together seamlessly.',
        },
        {
            icon: <IoHeart size={32} />,
            title: 'Student-First',
            description: 'Every feature we build puts student success at the forefront.',
        },
        {
            icon: <IoTrophy size={32} />,
            title: 'Excellence',
            description: 'We strive for excellence in every aspect of the placement process.',
        },
    ];

    const team = [
        { name: 'Dr. Sharma', role: 'Placement Director', initials: 'DS' },
        { name: 'Prof. Patel', role: 'Training Head', initials: 'PP' },
        { name: 'Ms. Gupta', role: 'Industry Relations', initials: 'MG' },
        { name: 'Mr. Kumar', role: 'Technical Lead', initials: 'MK' },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="bg-gradient-to-br from-primary-900 to-primary-800 text-white py-20">
                <div className="container mx-auto px-6">
                    <Link to="/" className="inline-flex items-center text-primary-200 hover:text-white mb-6 transition-colors">
                        <IoArrowBack className="mr-2" /> Back to Home
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">About HireSphere</h1>
                        <p className="text-xl text-primary-200 max-w-2xl">
                            Transforming campus placements through technology and innovation
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold text-primary-900 mb-6">Our Mission</h2>
                            <p className="text-lg text-primary-700 mb-4">
                                HireSphere was created with a simple yet powerful mission: to bridge the gap between talented students and leading employers through a seamless, transparent, and efficient placement process.
                            </p>
                            <p className="text-lg text-primary-700 mb-6">
                                We believe every student deserves equal access to opportunities, and every recruiter deserves access to the best talent. Our platform makes this possible.
                            </p>
                            <ul className="space-y-3">
                                {['Streamlined application process', 'Real-time tracking', 'Transparent communication', 'Data-driven insights'].map((item, idx) => (
                                    <li key={idx} className="flex items-center text-primary-700">
                                        <IoCheckmarkCircle className="text-secondary-500 mr-3" size={24} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-2xl p-8"
                        >
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                                    <p className="text-4xl font-bold text-secondary-600">2020</p>
                                    <p className="text-primary-600">Established</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                                    <p className="text-4xl font-bold text-secondary-600">5000+</p>
                                    <p className="text-primary-600">Students</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                                    <p className="text-4xl font-bold text-secondary-600">200+</p>
                                    <p className="text-primary-600">Companies</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                                    <p className="text-4xl font-bold text-secondary-600">95%</p>
                                    <p className="text-primary-600">Success Rate</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-primary-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-primary-900 mb-4">Our Values</h2>
                        <p className="text-lg text-primary-600">The principles that guide everything we do</p>
                    </motion.div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-xl text-center shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="w-16 h-16 bg-secondary-100 text-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-primary-900 mb-2">{value.title}</h3>
                                <p className="text-primary-600">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-primary-900 mb-4">Our Team</h2>
                        <p className="text-lg text-primary-600">Meet the people behind HireSphere</p>
                    </motion.div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-primary-700 to-primary-900 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                                    {member.initials}
                                </div>
                                <h3 className="text-lg font-semibold text-primary-900">{member.name}</h3>
                                <p className="text-primary-600">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-secondary-600">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Join HireSphere Today</h2>
                    <Link to="/register">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-white text-secondary-600 font-semibold rounded-xl shadow-lg"
                        >
                            Get Started
                        </motion.button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default About;
