import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoChevronDown, IoSearch } from 'react-icons/io5';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            category: 'For Students',
            questions: [
                {
                    q: 'How do I register on HireSphere?',
                    a: 'Click on the "Register" button on the homepage. Select "Student" as your role, fill in your college email and create a password. You will receive a verification email to activate your account.',
                },
                {
                    q: 'How can I apply for placement drives?',
                    a: 'After logging in, navigate to "Browse Drives" to see all available opportunities. Click on any drive to view details and eligibility criteria. If you meet the requirements, you can apply with any of your uploaded resumes.',
                },
                {
                    q: 'Can I upload multiple resumes?',
                    a: 'Yes! You can upload multiple resumes with custom names in your Profile section. When applying to drives, you can select which resume to use for each application.',
                },
                {
                    q: 'How do I track my application status?',
                    a: 'Go to "My Applications" in your dashboard to see all your applications and their current status. You will also receive notifications when your application status changes.',
                },
                {
                    q: 'What happens after I receive an offer?',
                    a: 'If you are selected, you will receive a notification and the offer will appear in your "My Offers" section. You can view and download the offer letter from there.',
                },
            ],
        },
        {
            category: 'For Recruiters',
            questions: [
                {
                    q: 'How do I register my company?',
                    a: 'Click "Register" and select "Recruiter" role. Fill in your company details and submit for approval. The placement cell will review and approve your account.',
                },
                {
                    q: 'How do I create a placement drive?',
                    a: 'After approval, go to your dashboard and click "Create Drive". Fill in the job details, eligibility criteria, and hiring process stages. Submit for admin approval.',
                },
                {
                    q: 'How do I review applications?',
                    a: 'Navigate to your drive and click "View Applicants". You can filter, sort, and review applications. Approve or reject candidates at each stage of your hiring process.',
                },
                {
                    q: 'How do I send offer letters?',
                    a: 'For selected candidates, you can upload and send offer letters directly through the platform. Students will be notified and can download their offer letters.',
                },
            ],
        },
        {
            category: 'General',
            questions: [
                {
                    q: 'Is HireSphere free to use?',
                    a: 'Yes, HireSphere is free for students and educational institutions. Recruiters may have tiered access based on their partnership level with the institution.',
                },
                {
                    q: 'How secure is my data?',
                    a: 'We take data security seriously. All data is encrypted and stored securely. We follow industry best practices and comply with data protection regulations.',
                },
                {
                    q: 'Who do I contact for technical issues?',
                    a: 'For technical support, email us at support@college.edu or use the Contact page. Our team typically responds within 24 hours.',
                },
                {
                    q: 'Can I use HireSphere on mobile devices?',
                    a: 'Yes! HireSphere is fully responsive and works on all devices including smartphones and tablets.',
                },
            ],
        },
    ];

    const filteredFaqs = searchQuery
        ? faqs.map(category => ({
            ...category,
            questions: category.questions.filter(
                q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.a.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        })).filter(category => category.questions.length > 0)
        : faqs;

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
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-xl text-primary-200 max-w-2xl">
                            Find answers to common questions about HireSphere
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Search */}
            <section className="py-10 bg-primary-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto relative">
                        <IoSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400" size={24} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for answers..."
                            className="w-full pl-12 pr-4 py-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16">
                <div className="container mx-auto px-6 max-w-4xl">
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-primary-600 text-lg">No results found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        filteredFaqs.map((category, catIdx) => (
                            <motion.div
                                key={catIdx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-12"
                            >
                                <h2 className="text-2xl font-bold text-primary-900 mb-6 pb-2 border-b border-primary-200">
                                    {category.category}
                                </h2>
                                <div className="space-y-4">
                                    {category.questions.map((faq, idx) => {
                                        const globalIndex = `${catIdx}-${idx}`;
                                        const isOpen = openIndex === globalIndex;
                                        return (
                                            <motion.div
                                                key={idx}
                                                className={`border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-secondary-300 shadow-md' : 'border-primary-200'}`}
                                            >
                                                <button
                                                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-primary-50 transition-colors"
                                                >
                                                    <span className="font-medium text-primary-900 pr-4">{faq.q}</span>
                                                    <motion.div
                                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <IoChevronDown className="text-primary-500" size={20} />
                                                    </motion.div>
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <div className="px-6 py-4 bg-primary-50 text-primary-700 border-t border-primary-100">
                                                                {faq.a}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-primary-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold text-primary-900 mb-4">Still have questions?</h2>
                    <p className="text-primary-600 mb-6">Can't find what you're looking for? Contact our support team.</p>
                    <Link to="/contact">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-secondary-600 hover:bg-secondary-700 text-white font-semibold rounded-xl transition-colors"
                        >
                            Contact Support
                        </motion.button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default FAQ;
