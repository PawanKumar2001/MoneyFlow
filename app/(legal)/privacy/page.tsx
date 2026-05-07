export default function PrivacyPage() {
  return (
    <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold text-lg mb-2">
            1. Information We Collect
          </h2>
          <p>
            MoneyFlow collects information you provide directly to us, including
            your name, email address, and financial data you enter into the
            application such as expenses, income, and subscriptions.
          </p>
        </section>
        <section>
          <h2 className="text-white font-semibold text-lg mb-2">
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services, process transactions, and send you technical notices.
            Your financial data is used solely to provide you with expense
            tracking and financial insights.
          </p>
        </section>
        <section>
          <h2 className="text-white font-semibold text-lg mb-2">
            3. Data Storage
          </h2>
          <p>
            Your data is stored securely in our database. We use
            industry-standard security measures to protect your personal
            information. We do not sell your personal data to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-white font-semibold text-lg mb-2">
            4. Google Authentication
          </h2>
          <p>
            If you choose to sign in with Google, we receive your name, email
            address, and profile picture from Google. We do not receive your
            Google password.
          </p>
        </section>
        <section>
          <h2 className="text-white font-semibold text-lg mb-2">
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at kumarpawanedward@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
}