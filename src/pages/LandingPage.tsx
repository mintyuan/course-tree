import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { csTemplate, automationTemplate, blankTemplate } from '../templates';

export function LandingPage() {
  const navigate = useNavigate();

  const createTree = async (template: 'blank' | 'cs' | 'automation') => {
    try {
      let content;
      switch (template) {
        case 'cs':
          content = csTemplate;
          break;
        case 'automation':
          content = automationTemplate;
          break;
        default:
          content = blankTemplate;
      }

      const { data, error } = await supabase
        .from('trees')
        .insert({ content })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating tree:', error);
        return;
      }

      if (data && data.id) {
        navigate(`/?id=${data.id}`);
      }
    } catch (err) {
      console.error('Unexpected error creating tree:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF0] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#4A3B2A] mb-12" style={{ fontFamily: "'Nunito', sans-serif" }}>CourseTree</h1>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <button
            onClick={() => createTree('blank')}
            className="px-8 py-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-[#4A3B2A] font-semibold text-lg border-2 border-[#F9E4B7]"
          >
            Start Blank
          </button>
          <button
            onClick={() => createTree('cs')}
            className="px-8 py-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-[#4A3B2A] font-semibold text-lg border-2 border-[#F9E4B7]"
          >
            Load CS Template
          </button>
          <button
            onClick={() => createTree('automation')}
            className="px-8 py-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-[#4A3B2A] font-semibold text-lg border-2 border-[#F9E4B7]"
          >
            Load Automation Template
          </button>
        </div>
      </div>
    </div>
  );
}

