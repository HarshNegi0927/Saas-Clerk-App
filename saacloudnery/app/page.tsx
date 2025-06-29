import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { Upload, Video, ImageIcon, Share2, Cloud, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      {/* Header */}
      <header className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="navbar-start">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MediaVault
            </span>
          </div>
        </div>

        <div className="navbar-end">
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-ghost">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-primary">Get Started</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/video-upload">
                <button className="btn btn-ghost">Upload</button>
              </Link>
              <Link href="/videos">
                <button className="btn btn-primary">My Videos</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Upload, Share & Manage Your Media
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-80">
              Securely upload videos and images to the cloud. Share with anyone, anywhere. Built with cutting-edge
              technology for lightning-fast performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary btn-lg">
                    <Upload className="w-5 h-5 mr-2" />
                    Start Uploading Free
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="btn btn-outline btn-lg">Sign In</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/video-upload">
                  <button className="btn btn-primary btn-lg">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Now
                  </button>
                </Link>
                <Link href="/videos">
                  <button className="btn btn-outline btn-lg">View My Media</button>
                </Link>
              </SignedIn>
            </div>

            {/* Feature Preview */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="card bg-base-100 shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="card-body items-center text-center">
                  <Video className="w-12 h-12 text-primary mb-2" />
                  <h2 className="card-title">Video Upload</h2>
                  <p>Upload videos of any size with our advanced compression and streaming technology</p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
                <div className="card-body items-center text-center">
                  <ImageIcon className="w-12 h-12 text-secondary mb-2" />
                  <h2 className="card-title">Image Management</h2>
                  <p>Store and organize your images with automatic optimization and CDN delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for media management</h2>
            <p className="text-lg max-w-2xl mx-auto opacity-70">
              Powerful features built for creators, businesses, and teams who need reliable media hosting
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <Cloud className="w-16 h-16 text-info mb-4" />
                <h2 className="card-title">Cloud Storage</h2>
                <p>Secure cloud storage powered by Cloudinary with automatic backups and 99.9% uptime</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <Share2 className="w-16 h-16 text-success mb-4" />
                <h2 className="card-title">Easy Sharing</h2>
                <p>Share your media with custom links, embed codes, or direct social media integration</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <Shield className="w-16 h-16 text-secondary mb-4" />
                <h2 className="card-title">Secure & Private</h2>
                <p>Enterprise-grade security with Clerk authentication and encrypted file storage</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <Zap className="w-16 h-16 text-warning mb-4" />
                <h2 className="card-title">Lightning Fast</h2>
                <p>Global CDN delivery ensures your media loads instantly anywhere in the world</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <Upload className="w-16 h-16 text-error mb-4" />
                <h2 className="card-title">Bulk Upload</h2>
                <p>Upload multiple files at once with drag-and-drop interface and progress tracking</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <Video className="w-16 h-16 text-accent mb-4" />
                <h2 className="card-title">Video Processing</h2>
                <p>Automatic video optimization, thumbnail generation, and multiple format support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero bg-gradient-to-r from-primary to-secondary py-20 text-primary-content">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of creators and businesses who trust MediaVault for their media hosting needs
            </p>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn btn-accent btn-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Start Free Today
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/video-upload">
                <button className="btn btn-accent btn-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your First File
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <div className="grid grid-flow-col gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">MediaVault</span>
          </div>
        </div>

        <div className="grid grid-flow-col gap-8 text-center">
          <div>
            <span className="footer-title">Features</span>
            <div className="grid grid-flow-row gap-2">
              <a className="link link-hover">Video Upload</a>
              <a className="link link-hover">Image Management</a>
              <a className="link link-hover">Cloud Storage</a>
              <a className="link link-hover">Social Sharing</a>
            </div>
          </div>

          <div>
            <span className="footer-title">Technology</span>
            <div className="grid grid-flow-row gap-2">
              <a className="link link-hover">Next.js</a>
              <a className="link link-hover">Clerk Auth</a>
              <a className="link link-hover">Neon Database</a>
              <a className="link link-hover">Cloudinary</a>
            </div>
          </div>

          <div>
            <span className="footer-title">Support</span>
            <div className="grid grid-flow-row gap-2">
              <a className="link link-hover">Documentation</a>
              <a className="link link-hover">API Reference</a>
              <a className="link link-hover">Contact Us</a>
              <a className="link link-hover">Status Page</a>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <p>Copyright © 2024 MediaVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
