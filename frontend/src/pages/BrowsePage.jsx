import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProjects } from '../api';
import { useAuth } from '../AuthContext';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function BrowsePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');

  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sort, setSort] = useState('recommended');

  const fetchProjects = () => {
    setLoading(true);
    const params = { search, skill, status: 'open' };
    if (minBudget) params.min_budget = minBudget;
    if (maxBudget) params.max_budget = maxBudget;
    if (sort !== 'recommended') params.ordering = sort === 'budget' ? '-budget' : '-created_at';

    getProjects(params)
      .then((r) => setProjects(r.data.results || r.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, [sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchProjects();
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div className="hero mb-8 flex-col gap-4" style={{ marginTop: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h1 className="text-dark-theme" style={{ fontSize: 40, margin: 0 }}>{t('browse.hero_title')}</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', width: '100%', maxWidth: 900 }}>
          <div style={{ display: 'flex', flex: '1 1 200px', background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 16px', alignItems: 'center', border: '1px solid var(--border)' }}>
            <Search size={20} className="text-muted" />
            <input
              style={{ flex: 1, border: 'none', padding: '12px', fontSize: 16, outline: 'none', color: 'var(--text-primary)', background: 'transparent', minWidth: 0 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('browse.search_placeholder')}
            />
          </div>
          <div style={{ display: 'flex', flex: '1 1 150px', background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 16px', alignItems: 'center', border: '1px solid var(--border)' }}>
            <Filter size={20} className="text-muted" />
            <input
              style={{ flex: 1, border: 'none', padding: '12px', fontSize: 16, outline: 'none', color: 'var(--text-primary)', background: 'transparent', minWidth: 0 }}
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('browse.skill_placeholder')}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 32px', fontSize: 16, borderRadius: 8, fontWeight: 700 }}>{t('browse.search_btn')}</button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <aside style={{ width: 260, flexShrink: 0 }} className="hidden-mobile">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-dark-theme" style={{ fontSize: 18, fontWeight: 700 }}>{t('browse.filters')}</h3>
            <SlidersHorizontal size={18} className="text-muted" />
          </div>
          <div className="card" style={{ padding: 20 }}>
            <form onSubmit={(e) => {
              e.preventDefault();
              fetchProjects();
            }}>
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-dark-theme">{t('browse.project_type')}</h4>
                <label className="flex items-center gap-2 mb-2 text-sm text-secondary"><input type="checkbox" /> {t('browse.hourly')}</label>
                <label className="flex items-center gap-2 mb-2 text-sm text-secondary"><input type="checkbox" defaultChecked /> {t('browse.fixed')}</label>
              </div>
              <div className="divider" style={{ margin: '16px 0' }} />
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-dark-theme">{t('browse.budget')}</h4>
                <div className="flex gap-2">
                  <input type="number" className="form-input" placeholder={t('browse.min')} style={{ padding: '6px 10px' }} value={minBudget} onChange={(e) => setMinBudget(e.target.value)} onKeyDown={handleKeyDown} />
                  <input type="number" className="form-input" placeholder={t('browse.max')} style={{ padding: '6px 10px' }} value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
              </div>
              <div className="divider" style={{ margin: '16px 0' }} />
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-dark-theme">{t('browse.client_history')}</h4>
                <label className="flex items-center gap-2 mb-2 text-sm text-secondary"><input type="checkbox" /> {t('browse.ten_hires')}</label>
                <label className="flex items-center gap-2 mb-2 text-sm text-secondary"><input type="checkbox" /> {t('browse.info_verified')}</label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>{t('browse.apply_filters')}</button>
            </form>
          </div>
        </aside>

        {/* Project List */}
        <main style={{ flex: 1 }}>
          <div className="mb-4 flex justify-between items-center">
            <span className="text-muted font-semibold">{t('browse.results_count', { count: projects.length })}</span>
            <select 
              className="form-select" 
              style={{ width: 140, padding: '6px 10px' }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recommended">{t('browse.sort_recommended')}</option>
              <option value="newest">{t('browse.sort_newest')}</option>
              <option value="budget">{t('browse.sort_budget')}</option>
            </select>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <Search size={48} className="icon mx-auto mb-4" />
              <h3>{t('browse.no_projects_title')}</h3>
              <p>{t('browse.no_projects_subtitle')}</p>
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

