import { FaGithub, FaLinkedin } from 'react-icons/fa';

const founders = [
  {
    name: 'Pratik Shrestha',
    title: 'Software Engineer',
    image: '/team/pratik.jpg',
    bio: 'thinker',
    linkedin: 'https://www.linkedin.com/in/pishrestha',
    github: 'https://github.com/PiShrestha',
  },
  {
    name: 'Kyle Luong',
    title: 'Lead Software Engineer',
    image: '/team/kyle.jpg',
    bio: 'creator',
    linkedin: 'https://www.linkedin.com/in/kylewl/',
    github: 'https://github.com/kyle-luong',
  },
  {
    name: 'Jonathan Lam',
    title: 'Software Engineer',
    image: '/team/jonathan.jpg',
    bio: 'solver',
    linkedin: 'https://www.linkedin.com/in/jonathanlam2/',
    github: 'https://github.com/Jonuhthan',
  },
];

function FounderCard({ founder }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 h-32 w-32 overflow-hidden rounded-full bg-slate-200">
          <img
            src={founder.image}
            alt={founder.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">{founder.name}</h3>
        <p className="mb-3 text-sm text-slate-500">{founder.title}</p>
        <p className="mb-4 text-slate-600">{founder.bio}</p>
        <div className="flex gap-4">
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition-colors hover:text-sky-600"
            aria-label={`${founder.name} LinkedIn`}
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href={founder.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition-colors hover:text-slate-900"
            aria-label={`${founder.name} GitHub`}
          >
            <FaGithub size={24} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">About calview</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            We're on a mission to help people visualize their schedules and navigate their days with
            ease. calview transforms your calendar into a shareable, map-aware experience.
          </p>
        </div>

        <h2 className="mb-6 text-center text-2xl font-semibold text-slate-900">Meet the Team</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {founders.map((founder) => (
            <FounderCard key={founder.name} founder={founder} />
          ))}
        </div>
      </div>
    </div>
  );
}
