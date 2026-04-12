import React from 'react';
import { useInView } from '../hooks/useInView';

const Blog = () => {
  const [ref, isVisible] = useInView();

  const posts = [
    {
      category: 'Interview Tips',
      title: 'Top 10 Questions to Ask Your Interviewer',
      desc: 'Turn the tables to show engagement and figure out if the company is the right fit for you.',
      author: { name: 'Sarah Jenkins', initial: 'SJ', color: 'bg-purple-100 text-purple-700' },
      date: 'Oct 12, 2025',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      category: 'Career Advice',
      title: 'How to Explain an Employment Gap',
      desc: 'A strategic approach to framing time off as a period of growth and learning.',
      author: { name: 'Mark Reynolds', initial: 'MR', color: 'bg-orange-100 text-orange-700' },
      date: 'Oct 08, 2025',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      category: 'Resume Guide',
      title: 'Writing Bullet Points that Land Interviews',
      desc: 'Move beyond task descriptions and start highlighting your measurable impact.',
      author: { name: 'Aisha Khan', initial: 'AK', color: 'bg-blue-100 text-blue-700' },
      date: 'Oct 01, 2025',
      gradient: 'from-cyan-400 to-blue-500'
    }
  ];

  return (
    <section id="blog" className="py-20 min-h-screen bg-white flex items-center">
      <div 
        ref={ref}
        className={`max-w-6xl mx-auto px-6 w-full fade-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl font-bold text-center text-gray-900">Latest from our Blog</h2>
        <p className="text-lg text-center text-gray-500 mt-3 mb-12">Tips, guides and insights for job seekers</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <article key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
              <div className={`h-40 bg-gradient-to-r ${post.gradient}`}></div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs font-bold uppercase tracking-wider text-green-accent mb-3 block">{post.category}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{post.desc}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${post.author.color}`}>
                      {post.author.initial}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-none">{post.author.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                    </div>
                  </div>
                  <button className="text-green-accent font-medium text-sm hover:underline">
                    Read More &rarr;
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
