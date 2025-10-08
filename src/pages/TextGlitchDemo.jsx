import React from 'react';
import { TextGlitch, TextGlitchWrapper } from '@/components/shared/TextGlitch';

/**
 * TextGlitch Demo Page
 * Demonstrates the high-end text scramble/glitch effect
 *
 * Access at: /text-glitch-demo
 */
export default function TextGlitchDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Header */}
        <header className="text-center space-y-4 pt-12">
          <TextGlitch
            text="TextGlitch Effect"
            className="text-6xl font-bold"
            as="h1"
            intensity="high"
          />
          <p className="text-neutral-400 text-lg">
            Hover over text for 2 seconds to activate the scramble effect
          </p>
        </header>

        {/* Intensity Levels */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-neutral-300">Intensity Levels</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Subtle */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 space-y-4">
              <h3 className="text-xl font-semibold text-neutral-400">Subtle</h3>
              <TextGlitch
                text="Minimal chromatic aberration"
                className="text-2xl font-medium"
                intensity="subtle"
              />
              <p className="text-sm text-neutral-500">
                Best for body text and navigation
              </p>
            </div>

            {/* Medium */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 space-y-4">
              <h3 className="text-xl font-semibold text-neutral-400">Medium</h3>
              <TextGlitch
                text="Balanced glitch effect"
                className="text-2xl font-medium"
                intensity="medium"
              />
              <p className="text-sm text-neutral-500">
                Ideal for headings and CTAs
              </p>
            </div>

            {/* High */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 space-y-4">
              <h3 className="text-xl font-semibold text-neutral-400">High</h3>
              <TextGlitch
                text="Maximum visual impact"
                className="text-2xl font-medium"
                intensity="high"
              />
              <p className="text-sm text-neutral-500">
                Perfect for hero sections
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-neutral-300">Use Cases</h2>

          {/* Hero Section Example */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-12 space-y-6">
            <TextGlitch
              text="Transform Your Business"
              className="text-5xl font-bold"
              as="h2"
              intensity="high"
              hoverDelay={1500}
            />
            <TextGlitch
              text="AI-powered solutions for the modern enterprise"
              className="text-xl text-neutral-400"
              intensity="subtle"
            />
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <TextGlitch
                text="Get Started"
                intensity="medium"
                hoverDelay={1000}
              />
            </button>
          </div>

          {/* Navigation Example */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8">
            <nav className="flex gap-8 justify-center">
              {['Home', 'About', 'Services', 'Work', 'Contact'].map((item) => (
                <TextGlitch
                  key={item}
                  text={item}
                  className="text-lg hover:text-blue-400 transition-colors"
                  intensity="subtle"
                  hoverDelay={1500}
                />
              ))}
            </nav>
          </div>

          {/* Card Grid Example */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'AI Strategy', desc: 'Transform your business with AI' },
              { title: 'Automation', desc: 'Streamline operations at scale' },
              { title: 'Analytics', desc: 'Data-driven decision making' }
            ].map((card) => (
              <div
                key={card.title}
                className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-3"
              >
                <TextGlitch
                  text={card.title}
                  className="text-2xl font-bold"
                  intensity="medium"
                  as="h3"
                />
                <TextGlitch
                  text={card.desc}
                  className="text-neutral-400"
                  intensity="subtle"
                />
              </div>
            ))}
          </div>
        </section>

        {/* TextGlitchWrapper Example */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-neutral-300">Complex Text Structures</h2>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 space-y-6">
            <TextGlitchWrapper text="Wrapped Heading" intensity="high">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Wrapped Heading
              </h3>
            </TextGlitchWrapper>

            <p className="text-neutral-400">
              Use <code className="bg-neutral-800 px-2 py-1 rounded">TextGlitchWrapper</code> when you need
              to preserve complex styling or nested elements while still applying the glitch effect.
            </p>
          </div>
        </section>

        {/* Customization Options */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-neutral-300">Customization Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fast Activation */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-semibold text-neutral-400">Fast Activation (1s)</h3>
              <TextGlitch
                text="Quick response time"
                className="text-2xl"
                hoverDelay={1000}
                intensity="medium"
              />
            </div>

            {/* Slow Activation */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-semibold text-neutral-400">Slow Activation (3s)</h3>
              <TextGlitch
                text="Delayed engagement"
                className="text-2xl"
                hoverDelay={3000}
                intensity="medium"
              />
            </div>

            {/* Fast Scramble */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-semibold text-neutral-400">Fast Scramble (400ms)</h3>
              <TextGlitch
                text="Lightning quick effect"
                className="text-2xl"
                scrambleDuration={400}
                intensity="high"
              />
            </div>

            {/* Slow Scramble */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-semibold text-neutral-400">Slow Scramble (1200ms)</h3>
              <TextGlitch
                text="Dramatic reveal"
                className="text-2xl"
                scrambleDuration={1200}
                intensity="high"
              />
            </div>
          </div>
        </section>

        {/* Implementation Guide */}
        <section className="space-y-8 pb-16">
          <h2 className="text-3xl font-bold text-neutral-300">Implementation Guide</h2>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Basic Usage</h3>
              <pre className="bg-neutral-950 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-neutral-300">{`import { TextGlitch } from '@/components/shared/TextGlitch';

<TextGlitch
  text="Your text here"
  intensity="subtle"
  hoverDelay={2000}
  scrambleDuration={800}
/>`}</code>
              </pre>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">With Custom Element</h3>
              <pre className="bg-neutral-950 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-neutral-300">{`<TextGlitch
  text="Hero Heading"
  as="h1"
  className="text-6xl font-bold"
  intensity="high"
/>`}</code>
              </pre>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Complex Structures</h3>
              <pre className="bg-neutral-950 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-neutral-300">{`import { TextGlitchWrapper } from '@/components/shared/TextGlitch';

<TextGlitchWrapper text="Styled Text" intensity="medium">
  <h2 className="gradient-text">Styled Text</h2>
</TextGlitchWrapper>`}</code>
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Props</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><code className="text-blue-400">text</code>: Original text to display</li>
                <li><code className="text-blue-400">intensity</code>: 'subtle' | 'medium' | 'high'</li>
                <li><code className="text-blue-400">hoverDelay</code>: Delay before effect starts (ms)</li>
                <li><code className="text-blue-400">scrambleDuration</code>: Animation duration (ms)</li>
                <li><code className="text-blue-400">as</code>: HTML element to render as</li>
                <li><code className="text-blue-400">className</code>: Additional CSS classes</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
