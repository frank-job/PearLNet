import Link from 'next/link';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/login"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-black text-blue-600 mt-4 mb-6 tracking-tight">
          Privacy Policy
        </h1>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Your privacy is important to us. This Privacy Policy explains how we
            collect, use, and protect your information when you use Rat.
          </p>
          <h2 className="text-lg font-bold text-foreground">1. Information We Collect</h2>
          <p>
            We collect the information you provide directly, such as your
            username, email address, profile details, and the content you post.
          </p>
          <h2 className="text-lg font-bold text-foreground">2. How We Use Your Information</h2>
          <p>
            We use your information to operate the service, personalize your
            experience, and provide features like likes, comments, follows, and
            notifications.
          </p>
          <h2 className="text-lg font-bold text-foreground">3. Data Storage</h2>
          <p>
            Your data is stored securely and is only accessible to you and the
            intended recipients of your shared content.
          </p>
          <h2 className="text-lg font-bold text-foreground">4. Sharing</h2>
          <p>
            We do not sell your personal information to third parties. Your
            public profile and posts are visible to other users of the app.
          </p>
          <h2 className="text-lg font-bold text-foreground">5. Your Rights</h2>
          <p>
            You may update or delete your account information at any time
            through your account settings.
          </p>
          <p className="pt-4 text-muted">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}
