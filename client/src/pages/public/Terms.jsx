import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const Terms = () => {
    const lastUpdated = 'January 10, 2026';

    const sections = [
        {
            title: '1. Acceptance of Terms',
            content: 'By accessing or using HireSphere, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all users including students, recruiters, and administrators.',
        },
        {
            title: '2. Description of Service',
            content: 'HireSphere is a campus placement management platform that connects students with recruiters. We provide tools for profile management, job applications, recruitment drives, and offer letter management. We reserve the right to modify, suspend, or discontinue any part of our service at any time.',
        },
        {
            title: '3. User Accounts',
            content: 'To access our services, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must immediately notify us of any unauthorized use of your account.',
        },
        {
            title: '4. User Responsibilities',
            subsections: [
                {
                    subtitle: 'For Students',
                    points: [
                        'Provide accurate academic and personal information',
                        'Upload authentic resumes and documents',
                        'Apply only to drives for which you are eligible',
                        'Respond professionally to all communications',
                        'Honor offer acceptances and commitments',
                    ],
                },
                {
                    subtitle: 'For Recruiters',
                    points: [
                        'Provide accurate company and job information',
                        'Conduct fair and non-discriminatory hiring',
                        'Protect candidate information confidentiality',
                        'Honor offers made through the platform',
                        'Complete the recruitment process in a timely manner',
                    ],
                },
            ],
        },
        {
            title: '5. Prohibited Conduct',
            points: [
                'Providing false or misleading information',
                'Impersonating another person or entity',
                'Attempting to access unauthorized areas of the platform',
                'Interfering with the proper functioning of the service',
                'Using the platform for illegal or unauthorized purposes',
                'Scraping or harvesting data without permission',
                'Harassing other users or engaging in discriminatory behavior',
            ],
        },
        {
            title: '6. Intellectual Property',
            content: 'The HireSphere platform, including its design, features, and content, is protected by intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of our service without written permission. You retain ownership of content you submit but grant us a license to use it for providing our services.',
        },
        {
            title: '7. Disclaimer of Warranties',
            content: 'HireSphere is provided "as is" without warranties of any kind. We do not guarantee employment outcomes or the accuracy of information provided by other users. We are not responsible for hiring decisions made by recruiters or acceptance decisions made by students.',
        },
        {
            title: '8. Limitation of Liability',
            content: 'To the maximum extent permitted by law, HireSphere and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid us in the past twelve months.',
        },
        {
            title: '9. Termination',
            content: 'We may suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion. Upon termination, your right to use the service will immediately cease. You may also delete your account at any time through your profile settings.',
        },
        {
            title: '10. Changes to Terms',
            content: 'We may update these Terms of Service from time to time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.',
        },
        {
            title: '11. Governing Law',
            content: 'These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in the platform\'s registered location.',
        },
        {
            title: '12. Contact Information',
            content: 'For questions about these Terms of Service, please contact us at legal@college.edu or through our Contact page.',
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
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
                            Welcome to HireSphere. These Terms of Service govern your use of our campus placement platform. Please read them carefully before using our services.
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

                                {section.content && (
                                    <p className="text-primary-700 mb-4">{section.content}</p>
                                )}

                                {section.points && (
                                    <ul className="list-disc list-inside space-y-2 text-primary-700 ml-4">
                                        {section.points.map((point, pointIdx) => (
                                            <li key={pointIdx}>{point}</li>
                                        ))}
                                    </ul>
                                )}

                                {section.subsections && section.subsections.map((sub, subIdx) => (
                                    <div key={subIdx} className="mb-4">
                                        <h3 className="text-lg font-semibold text-primary-800 mb-2">{sub.subtitle}</h3>
                                        <ul className="list-disc list-inside space-y-2 text-primary-700 ml-4">
                                            {sub.points.map((point, pointIdx) => (
                                                <li key={pointIdx}>{point}</li>
                                            ))}
                                        </ul>
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
                    <Link to="/privacy" className="text-secondary-600 hover:text-secondary-700 font-medium underline">
                        Privacy Policy
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Terms;
