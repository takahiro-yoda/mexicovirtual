'use client'

import { useState } from 'react'
import { Check, Plane, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ApplyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ifcUsername: '',
    email: '',
    discordUsername: '',
    grade: '',
    totalFlightTime: '',
    yearsOfExperience: '',
    motivation: '',
    ageConfirmed: false,
    englishConfirmed: false,
    ifvarbConfirmed: false,
    termsAccepted: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ifcUsername: formData.ifcUsername,
          email: formData.email,
          discordUsername: formData.discordUsername,
          grade: formData.grade,
          totalFlightTime: formData.totalFlightTime || null,
          yearsOfExperience: formData.yearsOfExperience || null,
          motivation: formData.motivation,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      const data = await response.json()
      
      // Show success message and reset form
      alert('Application submitted successfully! We will review your application and get back to you soon.')
      
      // Reset form
      setFormData({
        ifcUsername: '',
        email: '',
        discordUsername: '',
        grade: '',
        totalFlightTime: '',
        yearsOfExperience: '',
        motivation: '',
        ageConfirmed: false,
        englishConfirmed: false,
        ifvarbConfirmed: false,
        termsAccepted: false,
      })
    } catch (error: any) {
      console.error('Error submitting application:', error)
      alert(error.message || 'Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <div className="apply-page pt-20 min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
      {/* Fixed background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* White logo decoration - full page background */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] md:w-[1600px] md:h-[1600px] opacity-20 pointer-events-none">
          <img 
            src="/AMVA-log-1-white-full.png" 
            alt="AMVA Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10">
        <section className="relative py-32 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-flex items-center justify-center mb-6">
              <Plane className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl pb-2">
              Apply Today
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-100 font-light">
              Ready to start your journey with <span className="text-cyan-300 font-semibold">MexicoVirtual</span>?
            </p>
          </div>
        </section>

        <section className="relative py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
            {/* Requirements */}
            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 to-purple-500/15 rounded-2xl"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Requirements
                </h2>
                <ul className="space-y-4 text-gray-100">
                  <li className="flex items-center group">
                    <div className="mr-4 p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 group-hover:border-cyan-400/60 transition-colors">
                      <Check className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="group-hover:text-cyan-300 transition-colors">Be at least 13 years old</span>
                  </li>
                  <li className="flex items-center group">
                    <div className="mr-4 p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 group-hover:border-cyan-400/60 transition-colors">
                      <Check className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="group-hover:text-cyan-300 transition-colors">Be able to communicate in English</span>
                  </li>
                  <li className="flex items-center group">
                    <div className="mr-4 p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 group-hover:border-cyan-400/60 transition-colors">
                      <Check className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="group-hover:text-cyan-300 transition-colors">Be at least Grade 3 in Infinite Flight</span>
                  </li>
                  <li className="flex items-center group">
                    <div className="mr-4 p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 group-hover:border-cyan-400/60 transition-colors">
                      <Check className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="group-hover:text-cyan-300 transition-colors">Have a Discord and an Infinite Flight Community account</span>
                  </li>
                  <li className="flex items-center group">
                    <div className="mr-4 p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 group-hover:border-cyan-400/60 transition-colors">
                      <Check className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="group-hover:text-cyan-300 transition-colors">Not blacklisted by IFVARB</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 space-y-6 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 to-purple-500/15 rounded-2xl"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Application Form
                </h2>

              {/* Personal Information */}
              <div>
                <label htmlFor="ifcUsername" className="block text-sm font-medium text-cyan-200 mb-2">
                  Infinite Flight Community Username *
                </label>
                <input
                  type="text"
                  id="ifcUsername"
                  name="ifcUsername"
                  required
                  value={formData.ifcUsername}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-cyan-400/60"
                  placeholder="Enter your IFC username"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cyan-200 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-cyan-400/60"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="discordUsername" className="block text-sm font-medium text-cyan-200 mb-2">
                  Discord Username *
                </label>
                <input
                  type="text"
                  id="discordUsername"
                  name="discordUsername"
                  required
                  value={formData.discordUsername}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-cyan-400/60"
                  placeholder="username#1234"
                />
              </div>

              {/* Infinite Flight Information */}
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-cyan-200 mb-2">
                  Infinite Flight Grade *
                </label>
                <select
                  id="grade"
                  name="grade"
                  required
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-cyan-400/60"
                >
                  <option value="" className="bg-gray-900">Select Grade</option>
                  <option value="1" className="bg-gray-900">Grade 1</option>
                  <option value="2" className="bg-gray-900">Grade 2</option>
                  <option value="3" className="bg-gray-900">Grade 3</option>
                  <option value="4" className="bg-gray-900">Grade 4</option>
                  <option value="5" className="bg-gray-900">Grade 5</option>
                </select>
              </div>

              <div>
                <label htmlFor="totalFlightTime" className="block text-sm font-medium text-cyan-200 mb-2">
                  Total Flight Time (hours) - Optional
                </label>
                <input
                  type="number"
                  id="totalFlightTime"
                  name="totalFlightTime"
                  value={formData.totalFlightTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-cyan-400/60"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-cyan-200 mb-2">
                  Years of Experience - Optional
                </label>
                <input
                  type="number"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-cyan-400/60"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="motivation" className="block text-sm font-medium text-cyan-200 mb-2">
                  Why do you want to join MexicoVirtual? *
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  required
                  rows={5}
                  value={formData.motivation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-cyan-400/60 resize-none"
                  placeholder="Tell us why you want to join MexicoVirtual..."
                />
              </div>

              {/* Confirmations */}
              <div className="space-y-4 pt-4">
                <label className="flex items-start group cursor-pointer">
                  <input
                    type="checkbox"
                    name="ageConfirmed"
                    required
                    checked={formData.ageConfirmed}
                    onChange={handleChange}
                    className="mt-1 mr-3 w-5 h-5 bg-gray-900/50 border-cyan-500/30 rounded focus:ring-2 focus:ring-cyan-400 text-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-100 group-hover:text-cyan-200 transition-colors">I confirm that I am at least 13 years old *</span>
                </label>

                <label className="flex items-start group cursor-pointer">
                  <input
                    type="checkbox"
                    name="englishConfirmed"
                    required
                    checked={formData.englishConfirmed}
                    onChange={handleChange}
                    className="mt-1 mr-3 w-5 h-5 bg-gray-900/50 border-cyan-500/30 rounded focus:ring-2 focus:ring-cyan-400 text-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-100 group-hover:text-cyan-200 transition-colors">I can communicate in English *</span>
                </label>

                <label className="flex items-start group cursor-pointer">
                  <input
                    type="checkbox"
                    name="ifvarbConfirmed"
                    required
                    checked={formData.ifvarbConfirmed}
                    onChange={handleChange}
                    className="mt-1 mr-3 w-5 h-5 bg-gray-900/50 border-cyan-500/30 rounded focus:ring-2 focus:ring-cyan-400 text-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-100 group-hover:text-cyan-200 transition-colors">I am not blacklisted by IFVARB *</span>
                </label>

                <label className="flex items-start group cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    required
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mt-1 mr-3 w-5 h-5 bg-gray-900/50 border-cyan-500/30 rounded focus:ring-2 focus:ring-cyan-400 text-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-100 group-hover:text-cyan-200 transition-colors">I accept the terms and conditions *</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-4 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transform hover:scale-[1.02] flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
              </button>
              </div>
            </form>

            {/* After Application */}
            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 mt-8 border border-purple-500/40 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 to-cyan-500/15 rounded-2xl"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  What Happens Next?
                </h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-100">
                  <li className="hover:text-cyan-200 transition-colors">Your application will be reviewed by our staff team</li>
                  <li className="hover:text-cyan-200 transition-colors">Review typically takes 2-5 business days</li>
                  <li className="hover:text-cyan-200 transition-colors">You will receive an email notification with the result</li>
                  <li className="hover:text-cyan-200 transition-colors">If approved, you&apos;ll receive instructions to access Crew Center</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}

