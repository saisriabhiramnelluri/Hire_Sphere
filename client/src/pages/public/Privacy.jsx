import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const Privacy = () => {
    const lastUpdated = 'January 10, 2026';

    const sections = [
        {
            title: '1. Information We Collect',
            content: [
                {
                    subtitle: 'Personal Information',
                    text: 'When you register on HireSphere, we collect personal information including your name, email address, phone number, date of birth, educational details, and professional information such as skills and work experience.',
                },
                {
                    subtitle: 'Resume and Documents',
                    text: 'We store resumes and documents you upload for application purposes. These files are securely stored and only shared with recruiters when you apply to their placement drives.',
                },
                {
                    subtitle: 'Usage Data',
                    text: 'We automatically collect information about how you interact with our platform, including pages visited, features used, and time spent on the platform.',
                },
            ],
        },
        {
            title: '2. How We Use Your Information',
            content: [
                {
                    text: 'We use your information to:',
                    list: [
                        'Facilitate the placement process between students and recruiters',
                        'Send notifications about application status and new opportunities',
                        'Improve our platform and user experience',
                        'Communicate important updates and announcements',
                        'Ensure platform security and prevent fraud',
                    ],
                },
            ],
        },
        {
            title: '3. Information Sharing',
            content: [
                {
                    text: 'Your information may be shared with:',
                    list: [
                        'Recruiters when you apply to their placement drives',
                        'College administration for placement verification',
                        'Service providers who help us operate the platform',
                        'Legal authorities when required by law',
                    ],
                },
                {
                    text: 'We do not sell your personal information to third parties.',
                },
            ],
        },
        {
            title: '4. Data Security',
            content: [
                {
                    text: 'We implement industry-standard security measures to protect your data, including:',
                    list: [
                        'Encryption of data in transit and at rest',
                        'Regular security audits and assessments',
                        'Access controls and authentication',
                        'Secure cloud storage with reputable providers',
                    ],
                },
            ],
        },
        {
            title: '5. Your Rights',
            content: [
                {
                    text: 'You have the right to:',
                    list: [
                        'Access your personal data',
                        'Request correction of inaccurate data',
                        'Request deletion of your account and data',
                        'Withdraw consent for optional data processing',
                        'Export your data in a portable format',
                    ],
                },
            ],
        },
        {
            title: '6. Cookies and Tracking',
            content: [
                {
                    text: 'We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze platform usage. You can control cookie settings through your browser.',
                },
            ],
        },
        {
            title: '7. Data Retention',
            content: [
                {
                    text: 'We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information as required by law or for legitimate business purposes.',
                },
            ],
        },
        {
            title: '8. Contact Us',
            content: [
                {
                    text: 'If you have questions about this Privacy Policy or want to exercise your rights, contact us at privacy@college.edu or through our Contact page.',
                },
            ],
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-primary-200">Last updated: {lastUpdated}</p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="container mx-auto px-6 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-lg max-w-none"
                    >
                        <p className="text-lg text-primary-700 mb-8">
                            At HireSphere, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
                        </p>

                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-10"
                            >
                                <h2 className="text-2xl font-bold text-primary-900 mb-4">{section.title}</h2>
                                {section.content.map((item, itemIdx) => (
                                    <div key={itemIdx} className="mb-4">
                                        {item.subtitle && (
                                            <h3 className="text-lg font-semibold text-primary-800 mb-2">{item.subtitle}</h3>
                                        )}
                                        {item.text && <p className="text-primary-700 mb-3">{item.text}</p>}
                                        {item.list && (
                                            <ul className="list-disc list-inside space-y-2 text-primary-700 ml-4">
                                                {item.list.map((listItem, listIdx) => (
                                                    <li key={listIdx}>{listItem}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Related Links */}
            <section className="py-12 bg-primary-50">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-primary-600 mb-4">Also see our</p>
                    <Link to="/terms" className="text-secondary-600 hover:text-secondary-700 font-medium underline">
                        Terms of Service
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Privacy;
