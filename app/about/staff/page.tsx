import { Users } from 'lucide-react'

export default function StaffPage() {
  const staffMembers = [
    {
      name: 'John Smith',
      position: 'Chief Executive Officer',
      department: 'Executive',
      bio: 'Aviation enthusiast with over 10 years of experience in virtual aviation.',
    },
    {
      name: 'Sarah Johnson',
      position: 'Chief Operations Officer',
      department: 'Operations',
      bio: 'Passionate about creating the best flight experience for our pilots.',
    },
    {
      name: 'Mike Davis',
      position: 'Head of Training',
      department: 'Training',
      bio: 'Dedicated to helping pilots develop their skills and reach their potential.',
    },
    {
      name: 'Emily Wilson',
      position: 'Community Manager',
      department: 'Community',
      bio: 'Ensuring our community remains welcoming and supportive for everyone.',
    },
  ]

  return (
    <div className="pt-20">
      <section className="py-20 bg-gradient-to-b from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Staff</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Meet the team behind MexicoVirtual
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-lg text-gray-700 mb-12">
              Our staff team consists of avid Infinite Flight users like yourself. 
              They are always eager to assist our pilots and give you a great experience with us.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {staffMembers.map((member, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary font-semibold mb-2">{member.position}</p>
                  <p className="text-gray-600 text-sm mb-3">{member.department}</p>
                  <p className="text-gray-700 text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

