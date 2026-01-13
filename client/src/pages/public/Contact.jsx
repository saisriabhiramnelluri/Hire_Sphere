import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    IoArrowBack,
    IoMail,
    IoCall,
    IoLocation,
    IoSend,
    IoLogoLinkedin,
    IoLogoTwitter
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [sending, setSending] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setSending(false);
    };

    const contactInfo = [
        {
            icon: <IoMail size={24} />,
            title: 'Email',
            value: 'placements@college.edu',
            link: 'mailto:placements@college.edu',
        },
        {
            icon: <IoCall size={24} />,
            title: 'Phone',
            value: '+91 1234 567 890',
            link: 'tel:+911234567890',
        },
        {
            icon: <IoLocation size={24} />,
            title: 'Address',
            value: 'Placement Cell, Main Building, College Campus',
            link: null,
        },
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                        <p className="text-xl text-primary-200 max-w-2xl">
                            Have questions? We'd love to hear from you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-2xl font-bold text-primary-900 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-primary-700 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary-700 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Your message..."
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={sending}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full px-6 py-4 bg-secondary-600 hover:bg-secondary-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {sending ? 'Sending...' : <>Send Message <IoSend /></>}
                                </motion.button>
                            </form>
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-2xl font-bold text-primary-900 mb-6">Get in Touch</h2>
                            <div className="space-y-6 mb-10">
                                {contactInfo.map((info, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 bg-primary-50 rounded-xl">
                                        <div className="w-12 h-12 bg-secondary-100 text-secondary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <p className="font-medium text-primary-900">{info.title}</p>
                                            {info.link ? (
                                                <a href={info.link} className="text-secondary-600 hover:underline">{info.value}</a>
                                            ) : (
                                                <p className="text-primary-600">{info.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-lg font-semibold text-primary-900 mb-4">Office Hours</h3>
                            <div className="bg-primary-50 rounded-xl p-6 mb-10">
                                <div className="flex justify-between py-2 border-b border-primary-200">
                                    <span className="text-primary-700">Monday - Friday</span>
                                    <span className="font-medium text-primary-900">9:00 AM - 5:00 PM</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-primary-200">
                                    <span className="text-primary-700">Saturday</span>
                                    <span className="font-medium text-primary-900">10:00 AM - 2:00 PM</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-primary-700">Sunday</span>
                                    <span className="font-medium text-primary-900">Closed</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-primary-900 mb-4">Follow Us</h3>
                            <div className="flex gap-4">
                                <a href="#" className="w-12 h-12 bg-primary-100 hover:bg-secondary-100 text-primary-700 hover:text-secondary-600 rounded-xl flex items-center justify-center transition-colors">
                                    <IoLogoLinkedin size={24} />
                                </a>
                                <a href="#" className="w-12 h-12 bg-primary-100 hover:bg-secondary-100 text-primary-700 hover:text-secondary-600 rounded-xl flex items-center justify-center transition-colors">
                                    <IoLogoTwitter size={24} />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
