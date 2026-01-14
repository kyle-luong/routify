export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: January 2026</p>
        </div>

        <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">1. Introduction</h2>
            <p className="text-slate-600">
              Welcome to Routify. We respect your privacy and are committed to protecting your
              personal data. This privacy policy explains how we collect, use, and safeguard your
              information when you use our calendar visualization service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">2. Information We Collect</h2>
            <p className="mb-3 text-slate-600">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-inside list-disc space-y-2 text-slate-600">
              <li>Calendar data from uploaded .ics files (event titles, times, locations)</li>
              <li>Contact information when you reach out to us (name, email)</li>
              <li>Usage data and analytics to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">3. How We Use Your Information</h2>
            <p className="mb-3 text-slate-600">We use the information we collect to:</p>
            <ul className="list-inside list-disc space-y-2 text-slate-600">
              <li>Provide and maintain our calendar visualization service</li>
              <li>Generate shareable schedule links</li>
              <li>Display your events on maps with location context</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Improve and optimize our service</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">4. Data Retention</h2>
            <p className="text-slate-600">
              Uploaded calendar data and generated schedule links are retained for 30 days after
              creation, after which they are automatically deleted. Contact form submissions are
              retained for up to 1 year for customer service purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">5. Data Security</h2>
            <p className="text-slate-600">
              We implement appropriate technical and organizational measures to protect your
              personal data against unauthorized access, alteration, disclosure, or destruction.
              All data is encrypted in transit using TLS and at rest using industry-standard
              encryption.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">6. Third-Party Services</h2>
            <p className="text-slate-600">
              We use third-party services for mapping functionality and analytics. These services
              may collect anonymized usage data in accordance with their own privacy policies. We
              do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">7. Your Rights</h2>
            <p className="mb-3 text-slate-600">You have the right to:</p>
            <ul className="list-inside list-disc space-y-2 text-slate-600">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">8. Contact Us</h2>
            <p className="text-slate-600">
              If you have any questions about this Privacy Policy or our data practices, please
              contact us through our{' '}
              <a href="/contact" className="text-sky-600 hover:text-sky-700 hover:underline">
                contact page
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
