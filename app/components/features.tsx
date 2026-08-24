export default function Features() {
  return (
    <div className="p-6 space-y-10">
      
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">
        Features on <span className="text-blue-600">PearlNet</span> to Experience
      </h1>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Feature 1 */}
        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-blue-600">Unlimited Fun</h2>
          <p className="mt-2 text-gray-600">
            Enjoy endless entertainment, creative posts, and real-time engagement that keeps the vibe alive.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-blue-600">Selinet Vibing Solutions</h2>
          <p className="mt-2 text-gray-600">
            Smart tools designed to help you express yourself, share moments, and stay connected effortlessly.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-blue-600">Connect With People</h2>
          <p className="mt-2 text-gray-600">
            Build meaningful connections, discover new friends, and grow your network across the PearlNet community.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-blue-600">Share Your World</h2>
          <p className="mt-2 text-gray-600">
            Post your moments, stories, and experiences with beautiful layouts and smooth interactions.
          </p>
        </div>

        {/* Feature 5 */}
        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-blue-600">Real-Time Engagement</h2>
          <p className="mt-2 text-gray-600">
            Instant reactions, comments, and interactions that make every moment feel alive.
          </p>
        </div>

        {/* Feature 6 */}
        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-blue-600">Community Powered</h2>
          <p className="mt-2 text-gray-600">
            A growing ecosystem built for creativity, connection, and positive vibes.
          </p>
        </div>

      </div>
    </div>
  );
}
