const categories = [
  'Web Development',
  'Mobile Apps',
  'UI/UX Design',
  'Data Science',
  'Content Writing',
  'Video Editing',
]

const aboutLinks = ['About', 'Careers', 'Press']
const supportLinks = ['Help & Support', 'Trust & Safety', 'Terms']
const communityLinks = ['Events', 'Blog', 'Forum']

export function Footer() {
  return (
    <footer className="bg-[var(--background-secondary)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground-muted)] mb-4">
              Categories
            </h3>
            <ul className="space-y-3">
              {categories.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[var(--foreground-hint)] hover:text-[var(--foreground-muted)] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground-muted)] mb-4">
              About
            </h3>
            <ul className="space-y-3">
              {aboutLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[var(--foreground-hint)] hover:text-[var(--foreground-muted)] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground-muted)] mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[var(--foreground-hint)] hover:text-[var(--foreground-muted)] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground-muted)] mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              {communityLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[var(--foreground-hint)] hover:text-[var(--foreground-muted)] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--foreground-hint)]">
            &copy; 2026 GigFlow
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-[var(--foreground-hint)] hover:text-[var(--foreground-muted)] transition-colors"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-sm text-[var(--foreground-hint)] hover:text-[var(--foreground-muted)] transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="text-sm text-[var(--foreground-hint)] hover:text-[var(--foreground-muted)] transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
