import Link from 'next/link';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/login"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-black text-blue-600 mt-4 mb-6 tracking-tight">
          Terms of Service
        </h1>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Welcome to Rat! These Terms of Service govern your use of our
            application. By creating an account, you agree to abide by these
            terms.
          </p>
          <h2 className="text-lg font-bold text-gray-900">1. Eligibility</h2>
          <p>
            You must be at least 13 years old to use Rat. By using the service,
            you represent that you meet this requirement.
          </p>
          <h2 className="text-lg font-bold text-gray-900">2. User Conduct</h2>
          <p>
            You agree not to post content that is illegal, harmful, threatening,
            abusive, defamatory, or infringes on the rights of others. You are
            solely responsible for the content you share.
          </p>
          <h2 className="text-lg font-bold text-gray-900">3. Account Security</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            password and for all activities that occur under your account.
          </p>
          <h2 className="text-lg font-bold text-gray-900">4. Termination</h2>
          <p>
            We may suspend or terminate your account if you violate these terms
            or engage in behavior that harms the community.
          </p>
          <h2 className="text-lg font-bold text-gray-900">5. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the
            service after changes constitutes acceptance of the new terms.
          </p>
          <p className="pt-4 text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}
