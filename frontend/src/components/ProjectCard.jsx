import React from 'react';
import { Briefcase, Heart, Star, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const getBadgeColor = (status) => {
    switch(status) {
      case 'open': return 'badge-success';
      case 'in_progress': return 'badge-warning';
      case 'completed': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  return (
    <Link to={`/projects/${project.id || ''}`} className="card flex-col" style={{ display: 'flex', textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-muted flex items-center gap-1 font-semibold">
            <Clock size={14} /> Posted {new Date(project.created_at || Date.now()).toLocaleDateString()}
          </span>
          <span className={`badge ${getBadgeColor(project.status || 'open')}`}>
            {project.status || 'Open'}
          </span>
        </div>
        
        <h3 className="mb-2" style={{ fontSize: '18px', color: '#111827', fontWeight: 700, lineHeight: 1.4 }}>
          {project.title || 'Project Title Placeholder'}
        </h3>
        
        <p className="text-muted text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description || 'This is a brief summary of what the client is looking for in this project...'}
        </p>

        <div className="flex gap-2 mb-4 flex-wrap">
          {(project.skills || ['React', 'Django', 'Design']).map((sk, i) => (
            <span key={i} className="tag">{sk.name || sk}</span>
          ))}
        </div>

        <div className="mt-auto pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-col">
            <span className="text-xs text-muted font-semibold uppercase tracking-wide">Budget</span>
            <span className="font-bold text-primary" style={{ fontSize: '18px' }}>
              ${project.budget || '1,500'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted font-semibold">{project.bids_count || 0} Proposals</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
