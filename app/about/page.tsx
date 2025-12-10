export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="py-20 bg-gradient-to-b from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Welcome to MexicoVirtual - The Home of Excellence
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-8">
              MexicoVirtual is dedicated to providing an exceptional virtual airline experience for Infinite Flight enthusiasts. 
              We strive to create a supportive community where pilots can develop their skills, explore the world, 
              and share their passion for aviation.
            </p>

            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-lg text-gray-700 mb-8">
              To be the leading virtual airline in the Infinite Flight community, recognized for excellence, 
              innovation, and our commitment to our pilots&apos; success and enjoyment.
            </p>

            <h2 className="text-3xl font-bold mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-primary">Excellence</h3>
                <p className="text-gray-700">
                  We maintain the highest standards in everything we do, from our operations to our community interactions.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-primary">Community</h3>
                <p className="text-gray-700">
                  We foster a supportive and welcoming environment where every pilot feels valued and included.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-primary">Innovation</h3>
                <p className="text-gray-700">
                  We continuously improve our systems and features to provide the best possible experience.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-primary">Growth</h3>
                <p className="text-gray-700">
                  We support our pilots in their journey to develop their skills and achieve their goals.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-6">Our History</h2>
            <p className="text-lg text-gray-700 mb-8">
              MexicoVirtual was founded with a vision to create a virtual airline that combines the excitement of flight simulation 
              with a strong sense of community. Since our inception, we have grown to become one of the most respected 
              virtual airlines in the Infinite Flight community, with hundreds of active pilots and thousands of completed flights.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

