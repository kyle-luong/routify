import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqs = [
  {
    question: 'How do I upload my calendar?',
    answer:
      'On the home page, click the upload area or drag and drop your .ics calendar file. Routify supports standard iCalendar files exported from Google Calendar, Apple Calendar, Outlook, and other calendar applications.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'Routify currently supports .ics (iCalendar) files. This is the universal calendar format supported by virtually all calendar applications. You can export this format from Google Calendar, Apple Calendar, Microsoft Outlook, and more.',
  },
  {
    question: 'How do I share my schedule?',
    answer:
      'After uploading your calendar, you\'ll receive a unique shareable link. Copy this link and send it to anyone you want to share your schedule with. They\'ll be able to view your events on both a calendar and map view.',
  },
  {
    question: 'How long are shared schedules available?',
    answer:
      'Shared schedules remain accessible via their unique links for 30 days after creation. After that, the data is automatically deleted for privacy.',
  },
  {
    question: 'Is my calendar data secure?',
    answer:
      'Yes, we take privacy seriously. Your calendar data is encrypted in transit and at rest. We do not sell or share your data with third parties. See our Privacy Policy for more details.',
  },
  {
    question: 'Can I edit events after uploading?',
    answer:
      'Currently, Routify is a view-only platform. To make changes, update your events in your original calendar application and re-upload the .ics file.',
  },
  {
    question: 'How does the map view work?',
    answer:
      'Events with location information are automatically plotted on an interactive map. You can see where your events are and understand the geographic context of your day at a glance.',
  },
  {
    question: 'Is Routify free to use?',
    answer:
      'Yes, Routify is currently free to use. We may introduce premium features in the future, but basic calendar viewing and sharing will always be free.',
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-sky-600"
      >
        <span className="pr-4 font-medium text-slate-900">{faq.question}</span>
        <span className="flex-shrink-0 text-slate-400">
          {isOpen ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 pr-8 text-slate-600">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">Help Center</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Find answers to frequently asked questions about using Routify.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-200">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Still have questions?</h3>
          <p className="mb-4 text-slate-600">
            Can't find what you're looking for? Reach out to our team.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-lg bg-sky-600 px-6 py-2 font-medium text-white transition-colors hover:bg-sky-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
