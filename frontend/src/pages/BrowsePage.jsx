import React, { useEffect, useState } from 'react';
import { getProjects } from '../api';
import { useAuth } from '../AuthContext';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function BrowsePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    getProjects({ search, skill, status: 'open' })
      .then((r) => setProjects(r.data.results || r.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div className="mb-8" style={{ background: '#022a1b', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', gap: 24, padding: '48px 40px', marginTop: '24px' }}>
        <h1 style={{ fontSize: 40, color: 'white', margin: 0 }}>Find the perfect freelance service</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', maxWidth: 900 }}>
          <div style={{ display: 'flex', flex: 1, minWidth: 280, background: 'white', borderRadius: 8, padding: '8px 16px', alignItems: 'center' }}>
            <Search size={20} className="text-muted" />
            <input
              style={{ flex: 1, border: 'none', padding: '12px', fontSize: 16, outline: 'none', color: '#111827' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What are you looking for?"
            />
          </div>
          <div style={{ display: 'flex', width: 240, background: 'white', borderRadius: 8, padding: '8px 16px', alignItems: 'center' }}>
            <Filter size={20} className="text-muted" />
            <input
              style={{ flex: 1, border: 'none', padding: '12px', fontSize: 16, outline: 'none', color: '#111827' }}
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Any specific skill?"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 32px', fontSize: 16, borderRadius: 8, fontWeight: 700 }}>Search</button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <aside style={{ width: 260, flexShrink: 0 }} className="hidden-mobile">
          <div className="mb-6 flex justify-between items-center">
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Filters</h3>
            <SlidersHorizontal size={18} className="text-muted" />
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Project Type</h4>
              <label className="flex items-center gap-2 mb-2 text-sm text-secondary"><input type="checkbox" /> Hourly Projects</label>
              <label className="flex items-center gap-2 mb-2 text-sm text-secondary"><input type="checkbox" defaultChecked /> Fixed Price</label>
            </div>
            <div className="divider" style={{ margin: '16px 0' }} />
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Budget (₹)</h4>
              <div className="flex gap-2">
                <input className="form-input" placeholder="Min" style={{ padding: '6px 10px' }} />
                <input className="form-input" placeholder="Max" style={{ padding: '6px 10px' }} />
              </div>
            </div>
            <div className="divider" style={{ margin: '16px 0' }} />
            <div>
              <h4 className="font-semibold mb-3">Client History</h4>
              <label className="flex items-center gap-2 mb-2 text-sm text-secondary"><input type="checkbox" /> 10+ Hires</label>
              <label className="flex items-center gap-2 mb-2 text-sm text-secondary"><input type="checkbox" /> Info Verified</label>
            </div>
          </div>
        </aside>

        {/* Project List */}
        <main style={{ flex: 1 }}>
          <div className="mb-4 flex justify-between items-center">
            <span className="text-muted font-semibold">{projects.length} services available</span>
            <select className="form-select" style={{ width: 140, padding: '6px 10px' }}>
              <option>Recommended</option>
              <option>Newest Arrivals</option>
              <option>Highest Budget</option>
            </select>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <Search size={48} className="text-muted mx-auto mb-4" />
              <h3>No Projects Found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid-3" style={{ gap: 24 }}>
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
