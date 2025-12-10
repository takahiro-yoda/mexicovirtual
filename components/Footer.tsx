import Link from 'next/link'
import { Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative z-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">MexicoVirtual</h3>
            <p className="text-gray-400 text-sm">
              The Home of Excellence. Your journey starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/operations/fleet" className="text-gray-400 hover:text-white transition">
                  Fleet
                </Link>
              </li>
              <li>
                <Link href="/operations/routes" className="text-gray-400 hover:text-white transition">
                  Routes
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-gray-400 hover:text-white transition">
                  Apply
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations */}
          <div>
            <h4 className="font-semibold mb-4">Operations</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/operations/ranks" className="text-gray-400 hover:text-white transition">
                  Ranks
                </Link>
              </li>
              <li>
                <Link href="/operations/special-features" className="text-gray-400 hover:text-white transition">
                  Special Features
                </Link>
              </li>
              <li>
                <Link href="/operations/codeshares" className="text-gray-400 hover:text-white transition">
                  Codeshares
                </Link>
              </li>
              <li>
                <Link href="/crew-center" className="text-gray-400 hover:text-white transition">
                  Crew Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Youtube size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            Infinite Flight&apos;s MexicoVirtual is not affiliated with, endorsed, or sponsored by any real world airline.
            MexicoVirtual is an organization operating under the regulation of the IFVARB, the governing body for virtual airlines in Infinite Flight.
          </p>
          <p className="mt-4">© {new Date().getFullYear()} MexicoVirtual. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

