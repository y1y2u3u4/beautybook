'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Calendar,
  Star,
  Users,
  BarChart3,
  Settings,
  Clock,
  Shield,
  CreditCard,
  Bell,
  MapPin,
  Filter,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  HelpCircle,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  steps?: string[];
  tips?: string[];
  color: string;
}

const customerGuide: GuideSection[] = [
  {
    id: 'search',
    title: 'Finding Providers',
    icon: <Search className="w-6 h-6" />,
    description: 'Learn how to search and discover the perfect beauty professional for your needs.',
    steps: [
      'Enter your desired service in the search bar (e.g., "Facial", "Hair Styling")',
      'Add your location to find nearby providers',
      'Click "Search" or press Enter to see results',
      'Use filters to narrow down your options'
    ],
    tips: [
      'Try different keywords to find more options',
      'Check "Verified" filter for trusted professionals',
      'Sort by rating or reviews for quality assurance'
    ],
    color: 'primary'
  },
  {
    id: 'filters',
    title: 'Using Filters',
    icon: <Filter className="w-6 h-6" />,
    description: 'Refine your search results with powerful filtering options.',
    steps: [
      'Select specialty to filter by service type',
      'Set minimum rating threshold (e.g., 4.5+)',
      'Choose availability (Today, This Week, Any)',
      'Adjust distance and price range sliders'
    ],
    tips: [
      'Combine multiple filters for precise results',
      'Clear filters to see all options again',
      'Insurance filter helps if you need coverage'
    ],
    color: 'secondary'
  },
  {
    id: 'profiles',
    title: 'Viewing Provider Profiles',
    icon: <Users className="w-6 h-6" />,
    description: 'Explore detailed information about each beauty professional.',
    steps: [
      'Click on a provider card to view their full profile',
      'Review their credentials and certifications',
      'Browse their portfolio and before/after photos',
      'Read customer reviews and ratings'
    ],
    tips: [
      'Check response time and availability patterns',
      'Look for specialties that match your needs',
      'Read recent reviews for current quality insight'
    ],
    color: 'accent'
  },
  {
    id: 'booking',
    title: 'Booking Appointments',
    icon: <Calendar className="w-6 h-6" />,
    description: 'Schedule your appointment in just a few clicks.',
    steps: [
      'Select the service you want from the provider\'s list',
      'Choose your preferred date from the calendar',
      'Pick an available time slot',
      'Review the booking summary and confirm'
    ],
    tips: [
      'Book in advance for popular providers',
      'Check cancellation policy before confirming',
      'Add notes for special requests'
    ],
    color: 'primary'
  },
  {
    id: 'reviews',
    title: 'Reviews & Ratings',
    icon: <Star className="w-6 h-6" />,
    description: 'Share your experience and help others make informed decisions.',
    steps: [
      'After your appointment, rate your experience',
      'Write a detailed review about the service',
      'Add photos if you\'d like to share results',
      'Submit your review to help the community'
    ],
    tips: [
      'Be specific about what you liked or disliked',
      'Mention the staff member who served you',
      'Update your review if issues are resolved'
    ],
    color: 'secondary'
  }
];

const providerGuide: GuideSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    icon: <BarChart3 className="w-6 h-6" />,
    description: 'Monitor your business performance at a glance.',
    steps: [
      'Access your dashboard from the navigation menu',
      'View key metrics: appointments, revenue, ratings',
      'Check upcoming appointments list',
      'Review recent customer feedback'
    ],
    tips: [
      'Check dashboard daily for important updates',
      'Use metrics to track growth over time',
      'Respond promptly to new bookings'
    ],
    color: 'primary'
  },
  {
    id: 'appointments',
    title: 'Appointment Management',
    icon: <Calendar className="w-6 h-6" />,
    description: 'Efficiently manage all your appointments.',
    steps: [
      'Navigate to Appointments from the sidebar',
      'Filter by status: Pending, Confirmed, Completed',
      'Click on an appointment for details',
      'Use Smart Assignment for staff scheduling'
    ],
    tips: [
      'Confirm appointments promptly to reduce no-shows',
      'Use batch actions for multiple appointments',
      'Set up notifications for new bookings'
    ],
    color: 'secondary'
  },
  {
    id: 'services',
    title: 'Service Management',
    icon: <Settings className="w-6 h-6" />,
    description: 'Create and manage your service offerings.',
    steps: [
      'Go to Services in your dashboard',
      'Click "Add Service" to create a new service',
      'Enter name, description, price, and duration',
      'Save and activate the service'
    ],
    tips: [
      'Use clear, descriptive service names',
      'Include what\'s included in the description',
      'Keep pricing competitive but fair'
    ],
    color: 'accent'
  },
  {
    id: 'staff',
    title: 'Team Management',
    icon: <Users className="w-6 h-6" />,
    description: 'Build and manage your team of professionals.',
    steps: [
      'Access Staff Management from the sidebar',
      'Click "Add Staff Member" to add team members',
      'Assign roles and set commission rates',
      'Manage availability and schedules'
    ],
    tips: [
      'Keep staff profiles updated',
      'Use role-based permissions wisely',
      'Track performance with reports'
    ],
    color: 'primary'
  },
  {
    id: 'calendar',
    title: 'Calendar Sync',
    icon: <Clock className="w-6 h-6" />,
    description: 'Keep your schedule synchronized across platforms.',
    steps: [
      'Go to Calendar Sync settings',
      'Click "Connect Google Calendar"',
      'Authorize the connection',
      'Configure sync preferences'
    ],
    tips: [
      'Enable two-way sync for best results',
      'Set buffer times between appointments',
      'Check for conflicts regularly'
    ],
    color: 'secondary'
  },
  {
    id: 'smart-assignment',
    title: 'Smart Assignment',
    icon: <Sparkles className="w-6 h-6" />,
    description: 'Automatically assign staff to appointments.',
    steps: [
      'Open Smart Assignment from Appointments page',
      'Select assignment strategy (Balanced, Skill-based, etc.)',
      'Preview the assignments',
      'Confirm to apply assignments'
    ],
    tips: [
      'Use "Balanced" for even workload distribution',
      'Use "Skill-based" for specialized services',
      'Review assignments before confirming'
    ],
    color: 'accent'
  }
];

const customerFAQ: FAQItem[] = [
  {
    question: 'How do I cancel or reschedule an appointment?',
    answer: 'Go to "My Appointments" in your customer dashboard, find the appointment, and click "Cancel" or "Reschedule". Please note that cancellation policies vary by provider, and you may be subject to cancellation fees depending on how close to the appointment time you cancel.'
  },
  {
    question: 'Are all providers verified?',
    answer: 'Providers with the "Verified" badge have completed our verification process, which includes license verification, insurance confirmation, and identity validation. We recommend booking with verified providers for the best experience.'
  },
  {
    question: 'How do I leave a review?',
    answer: 'After your appointment is completed, you\'ll receive an email invitation to leave a review. You can also go to your completed appointments and click "Leave Review" on any past appointment.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'Payment methods vary by provider. Most accept major credit cards, and some accept digital wallets. Check the provider\'s profile for specific payment options. Deposits may be required for certain services.'
  },
  {
    question: 'Can I book for someone else?',
    answer: 'Yes! During the booking process, you can add guest information if you\'re booking for someone else. Make sure to include their contact information for appointment reminders.'
  }
];

const providerFAQ: FAQItem[] = [
  {
    question: 'How do I accept new bookings?',
    answer: 'New bookings appear in your Appointments page with "Pending" status. Review the appointment details and click "Confirm" to accept, or "Decline" if you cannot accommodate the request. We recommend responding within 24 hours.'
  },
  {
    question: 'How does the Smart Assignment feature work?',
    answer: 'Smart Assignment automatically distributes appointments to your staff based on your chosen strategy: "Balanced" distributes workload evenly, "Skill-based" matches staff expertise to services, "Availability-based" considers current schedules, and "Random" provides fair distribution.'
  },
  {
    question: 'How do I set up my cancellation policy?',
    answer: 'Go to Settings > Cancellation Policy to configure your rules. You can set different fee percentages based on how far in advance the cancellation occurs (e.g., free cancellation 48+ hours before, 50% fee within 24 hours).'
  },
  {
    question: 'Can I block certain times from being booked?',
    answer: 'Yes! Use the Calendar Sync feature to block off times. You can also set recurring blocks for regular breaks or non-working hours. Connected Google Calendar events will automatically block corresponding times.'
  },
  {
    question: 'How do I get more visibility and bookings?',
    answer: 'Complete your profile with high-quality photos and detailed service descriptions. Respond quickly to booking requests, encourage satisfied customers to leave reviews, and maintain a high rating. Verified providers also receive a visibility boost.'
  }
];

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'provider'>('customer');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const currentGuide = activeTab === 'customer' ? customerGuide : providerGuide;
  const currentFAQ = activeTab === 'customer' ? customerFAQ : providerFAQ;

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'from-primary-500 to-primary-600 text-primary-600 bg-primary-50 border-primary-200';
      case 'secondary':
        return 'from-secondary-500 to-secondary-600 text-secondary-600 bg-secondary-50 border-secondary-200';
      case 'accent':
        return 'from-accent-500 to-accent-600 text-accent-600 bg-accent-50 border-accent-200';
      default:
        return 'from-primary-500 to-secondary-500 text-primary-600 bg-primary-50 border-primary-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">User Guide</h1>
                  <p className="text-sm text-neutral-500">Learn how to use BeautyBook</p>
                </div>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-white/50 rounded-xl p-1 border border-neutral-200">
              <button
                onClick={() => setActiveTab('customer')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'customer'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                For Customers
              </button>
              <button
                onClick={() => setActiveTab('provider')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'provider'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                For Providers
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-4 border border-primary-200">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">
              {activeTab === 'customer' ? 'Customer Guide' : 'Provider Guide'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {activeTab === 'customer'
              ? 'Find & Book Beauty Services Effortlessly'
              : 'Manage Your Beauty Business Like a Pro'}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {activeTab === 'customer'
              ? 'Discover everything you need to know about finding, booking, and enjoying beauty services on BeautyBook.'
              : 'Learn how to maximize your presence on BeautyBook and grow your beauty business.'}
          </p>
        </div>

        {/* Quick start video */}
        <div className="card-glass mb-12 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <PlayCircle className="w-10 h-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Quick Start Guide</h3>
                <p className="text-white/80">
                  Watch our 2-minute video to get started with BeautyBook
                </p>
              </div>
              <button className="btn-secondary bg-white text-primary-600 hover:bg-neutral-50">
                Watch Video
              </button>
            </div>
          </div>
        </div>

        {/* Guide sections */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent-500" />
            Step-by-Step Guides
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentGuide.map((section) => {
              const colors = getColorClasses(section.color);
              const isExpanded = expandedSection === section.id;

              return (
                <div
                  key={section.id}
                  className={`card-glass transition-all duration-300 ${
                    isExpanded ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  <div
                    className="flex items-start gap-4 cursor-pointer"
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.split(' ')[2]} ${colors.split(' ')[1]}`}>
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 mb-1">{section.title}</h4>
                      <p className="text-sm text-neutral-600">{section.description}</p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-neutral-200 animate-fade-in">
                      <div className="grid md:grid-cols-2 gap-6">
                        {section.steps && (
                          <div>
                            <h5 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                              <CheckCircle2 className={`w-4 h-4 ${colors.split(' ')[1]}`} />
                              Steps
                            </h5>
                            <ol className="space-y-2">
                              {section.steps.map((step, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r ${colors.split(' ')[0]} ${colors.split(' ')[1].replace('text-', 'to-')}`}>
                                    {index + 1}
                                  </span>
                                  <span className="text-neutral-700 flex-1">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {section.tips && (
                          <div>
                            <h5 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-accent-500" />
                              Pro Tips
                            </h5>
                            <ul className="space-y-2">
                              {section.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-neutral-700">
                                  <span className="text-accent-500">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ section */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-500" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {currentFAQ.map((faq, index) => (
              <div
                key={index}
                className="card-glass overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-neutral-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-5 pb-5 pt-0 animate-fade-in">
                    <div className="pt-3 border-t border-neutral-200">
                      <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href={activeTab === 'customer' ? '/providers' : '/provider/dashboard'}
            className="card-glass group hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white group-hover:shadow-glow transition-shadow">
                {activeTab === 'customer' ? <Search className="w-6 h-6" /> : <BarChart3 className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-neutral-900">
                  {activeTab === 'customer' ? 'Find Providers' : 'Go to Dashboard'}
                </h4>
                <p className="text-sm text-neutral-600">
                  {activeTab === 'customer' ? 'Start searching now' : 'Manage your business'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/test-mode"
            className="card-glass group hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl flex items-center justify-center text-white group-hover:shadow-glow transition-shadow">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-neutral-900">Try Test Mode</h4>
                <p className="text-sm text-neutral-600">Explore with sample data</p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/"
            className="card-glass group hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center text-white group-hover:shadow-glow transition-shadow">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-neutral-900">Back to Home</h4>
                <p className="text-sm text-neutral-600">Return to main page</p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Contact support */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/50 rounded-2xl border border-neutral-200">
            <HelpCircle className="w-5 h-5 text-neutral-500" />
            <span className="text-neutral-600">Still need help?</span>
            <Link href="/contact" className="text-primary-600 font-semibold hover:text-primary-700">
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
