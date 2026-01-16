export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">Terms of Service</h1>
          <p className="text-slate-500">Last updated: January 2026</p>
        </div>

        <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">1. Acceptance of Terms</h2>
            <p className="text-slate-600">
              By accessing or using calview, you agree to be bound by these Terms of Service. If you
              do not agree to these terms, please do not use our service. We reserve the right to
              modify these terms at any time, and your continued use of the service constitutes
              acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">2. Description of Service</h2>
            <p className="text-slate-600">
              calview is a calendar visualization service that allows users to upload calendar
              files, view events on interactive maps, and share schedules via unique links. The
              service is provided "as is" and we make no guarantees regarding availability or
              functionality.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">3. User Responsibilities</h2>
            <p className="mb-3 text-slate-600">As a user of calview, you agree to:</p>
            <ul className="list-inside list-disc space-y-2 text-slate-600">
              <li>Only upload calendar files that you have the right to share</li>
              <li>Not use the service for any unlawful purpose</li>
              <li>Not attempt to interfere with or disrupt the service</li>
              <li>Not upload malicious files or content</li>
              <li>Be responsible for maintaining the confidentiality of your shared links</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">4. Intellectual Property</h2>
            <p className="text-slate-600">
              The calview service, including its design, features, and content, is owned by us and
              protected by intellectual property laws. You retain ownership of any calendar data you
              upload, but grant us a limited license to process and display that data as part of
              providing the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">5. Privacy</h2>
            <p className="text-slate-600">
              Your use of calview is also governed by our{' '}
              <a href="/privacy" className="text-sky-600 hover:text-sky-700 hover:underline">
                Privacy Policy
              </a>
              , which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              6. Limitation of Liability
            </h2>
            <p className="text-slate-600">
              To the maximum extent permitted by law, calview and its operators shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages, including
              loss of data, profits, or business opportunities, arising from your use of or
              inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">7. Service Availability</h2>
            <p className="text-slate-600">
              We strive to maintain high availability but do not guarantee uninterrupted access to
              the service. We may modify, suspend, or discontinue any aspect of the service at any
              time without prior notice. Scheduled maintenance will be announced when possible.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">8. Termination</h2>
            <p className="text-slate-600">
              We reserve the right to terminate or suspend access to our service immediately,
              without prior notice, for conduct that we believe violates these Terms of Service or
              is harmful to other users, us, or third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">9. Governing Law</h2>
            <p className="text-slate-600">
              These Terms of Service shall be governed by and construed in accordance with the laws
              of the jurisdiction in which calview operates, without regard to its conflict of law
              provisions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">10. Contact</h2>
            <p className="text-slate-600">
              If you have any questions about these Terms of Service, please contact us through our{' '}
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
