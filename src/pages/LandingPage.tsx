import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { csTemplate, automationTemplate, blankTemplate } from '../templates';
import { TreeData } from '../types';
import { ParticleBackground } from '../components/ParticleBackground';

interface RecentTree {
  id: string;
  title: string;
  timestamp: number;
}

export function LandingPage() {
  const navigate = useNavigate();
  const [recentTrees, setRecentTrees] = useState<RecentTree[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent_trees');
      const list: RecentTree[] = stored ? JSON.parse(stored) : [];
      setRecentTrees(list.slice(0, 5));
    } catch (err) {
      console.error('Failed to load recent trees:', err);
    }
  }, []);

  const createTree = async (template: 'blank' | 'cs' | 'automation') => {
    try {
      let courses;
      switch (template) {
        case 'cs':
          courses = csTemplate;
          break;
        case 'automation':
          courses = automationTemplate;
          break;
        default:
          courses = blankTemplate;
      }

      const treeData: TreeData = {
        courses,
        title: 'My Course Tree',
        likes: 0,
        contact_info: null,
      };

      const { data, error } = await supabase
        .from('trees')
        .insert({ content: treeData })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating tree:', error);
        return;
      }

      if (data && data.id) {
        // Store tree ID in localStorage to identify owner
        localStorage.setItem(`tree_owner_${data.id}`, 'true');
        localStorage.setItem(`tree_just_created_${data.id}`, 'true');
        const recentEntry: RecentTree = { id: data.id, title: treeData.title, timestamp: Date.now() };
        const updatedRecent = [recentEntry, ...recentTrees.filter(item => item.id !== data.id)].slice(0, 5);
        localStorage.setItem('recent_trees', JSON.stringify(updatedRecent));
        setRecentTrees(updatedRecent);
        navigate(`/?id=${data.id}`);
      }
    } catch (err) {
      console.error('Unexpected error creating tree:', err);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4 relative">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Content with z-10 to appear above particles */}
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold text-[#5D4037] mb-12" style={{ fontFamily: "'Varela Round', sans-serif" }}>CourseTree</h1>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          {/* Start Blank - Warm Orange Theme */}
          <button
            onClick={() => createTree('blank')}
            className="px-8 py-4 bg-white rounded-full border-3 border-[#FF8C00] text-[#FF8C00] font-semibold text-lg button-3d"
          >
            Start Blank
          </button>

          {/* Load CS Template - Honey Gold Theme */}
          <button
            onClick={() => createTree('cs')}
            className="px-8 py-4 bg-white rounded-full border-3 border-[#F3D03E] text-[#F3D03E] font-semibold text-lg button-3d"
          >
            Load CS Template
          </button>

          {/* Load Automation Template - Soft Green Theme */}
          <button
            onClick={() => createTree('automation')}
            className="px-8 py-4 bg-white rounded-full border-3 border-[#78C850] text-[#78C850] font-semibold text-lg button-3d"
          >
            Load Automation Template
          </button>
        </div>

        {/* Resume Recent Trees - Collapsible Dropdown */}
        {recentTrees.length > 0 && (
          <div className="mt-10 max-w-md mx-auto relative z-10">
            {/* Trigger Button */}
            <button
              onClick={() => setShowRecent(!showRecent)}
              className="px-6 py-3 bg-white rounded-full border-3 border-[#8B7355] text-[#8B7355] font-semibold text-base button-3d w-full"
            >
              📂 Resume Recent Trees ({recentTrees.length})
            </button>

            {/* Collapsible List */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showRecent ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="flex flex-col gap-3">
                {recentTrees.map(tree => (
                  <button
                    key={tree.id}
                    onClick={() => navigate(`/?id=${tree.id}`)}
                    className="w-full text-left px-5 py-4 rounded-2xl bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg text-[#5D4037] border-3 border-[#E0E0E0] hover:border-[#78C850]"
                  >
                    <div className="font-bold text-lg">{tree.title || 'My Course Tree'}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

