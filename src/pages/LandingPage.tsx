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
    <div className="min-h-screen bg-[#FFFCF0] flex items-center justify-center px-4 relative">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Content with z-10 to appear above particles */}
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold text-[#4A3B2A] mb-12" style={{ fontFamily: "'Nunito', sans-serif" }}>CourseTree</h1>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          {/* Start Blank - Warm Orange Theme */}
          <button
            onClick={() => createTree('blank')}
            className="px-8 py-4 bg-white rounded-full border-2 border-[#FF8C00] text-[#FF8C00] font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,140,0,0.6)] hover:scale-105"
          >
            Start Blank
          </button>

          {/* Load CS Template - Honey Gold Theme */}
          <button
            onClick={() => createTree('cs')}
            className="px-8 py-4 bg-white rounded-full border-2 border-[#FFD700] text-[#FFD700] font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.6)] hover:scale-105"
          >
            Load CS Template
          </button>

          {/* Load Automation Template - Soft Green Theme */}
          <button
            onClick={() => createTree('automation')}
            className="px-8 py-4 bg-white rounded-full border-2 border-[#4ECDC4] text-[#4ECDC4] font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(78,205,196,0.6)] hover:scale-105"
          >
            Load Automation Template
          </button>
        </div>

        {recentTrees.length > 0 && (
          <div className="mt-10 max-w-md mx-auto bg-white/70 border-2 border-[#F9E4B7] rounded-2xl shadow-sm p-4 text-left relative z-10">
            <h2 className="text-lg font-bold text-[#4A3B2A] mb-3">Resume Recent Trees</h2>
            <div className="flex flex-col gap-2">
              {recentTrees.map(tree => (
                <button
                  key={tree.id}
                  onClick={() => navigate(`/?id=${tree.id}`)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-white hover:bg-[#F9E4B7]/40 transition-colors text-[#4A3B2A] border border-[#F9E4B7]"
                >
                  <div className="font-semibold">{tree.title || 'My Course Tree'}</div>
                  <div className="text-xs text-[#4A3B2A]/70 mt-1 break-all">ID: {tree.id}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

