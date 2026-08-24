/**
 * Video Scroll Scrub Demo Page
 * Demonstrates scroll-based video playback using your MP4 video
 */

import VideoScrollScrub from '../components/shared/VideoScrollScrub';

export default function VideoScrubDemo() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Text */}
      <section className="h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center px-4">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
            Scroll-Based Video
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto">
            Scroll down to scrub through the video frame by frame
          </p>
          <div className="mt-12 flex flex-col items-center">
            <span className="text-sm text-gray-400 uppercase tracking-wide mb-4">Scroll Down</span>
            <div className="w-px h-16 bg-white/30 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Video Scroll Scrub Section - Using your MP4 */}
      <VideoScrollScrub
        videoSrc="/videos/full-animation-scrub.mp4"
        title="Your Animation"
        description="Scroll to control video playback - each scroll moves through the frames"
        scrollTriggerOptions={{
          start: "top bottom",
          end: "bottom top",
          scrub: 1 // Smooth scrubbing
        }}
      />

      {/* Info Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8">
            How It Works
          </h2>

          <div className="space-y-6 text-gray-300">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Scroll-Based Video Scrubbing
              </h3>
              <ul className="space-y-3">
                <li><strong>Video:</strong> /videos/full-animation-scrub.mp4</li>
                <li><strong>Technology:</strong> GSAP ScrollTrigger + HTML5 Video API</li>
                <li><strong>Frame Accuracy:</strong> Uses requestVideoFrameCallback when available</li>
                <li><strong>Performance:</strong> Hardware accelerated, optimized for 60fps</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                How Scroll Scrubbing Works
              </h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li>As you scroll, GSAP calculates scroll progress (0 to 1)</li>
                <li>Progress is multiplied by video duration to get target frame</li>
                <li><code className="bg-gray-900 px-2 py-1 rounded">video.currentTime</code> is updated to match scroll position</li>
                <li>Video appears to "scrub" through frames as you scroll</li>
              </ol>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Customization Options
              </h3>
              <p className="mb-4">Edit the <code className="bg-gray-900 px-2 py-1 rounded">scrollTriggerOptions</code> prop:</p>
              <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-sm">
{`<VideoScrollScrub
  videoSrc="/videos/full-animation-scrub.mp4"
  scrollTriggerOptions={{
    start: "top bottom",  // When to start
    end: "bottom top",    // When to end
    scrub: 1              // Smoothness (0.1-3)
  }}
/>`}
              </pre>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Integration
              </h3>
              <p className="mb-4">To use this on any page:</p>
              <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-sm">
{`import VideoScrollScrub from '../components/shared/VideoScrollScrub';

<VideoScrollScrub
  videoSrc="/videos/your-video.mp4"
  title="Your Title"
  description="Your description"
/>`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for scroll testing */}
      <section className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Scroll Back Up
          </h2>
          <p className="text-xl text-gray-400">
            Notice how the video plays in reverse as you scroll up
          </p>
        </div>
      </section>
    </div>
  );
}