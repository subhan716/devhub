import React, { forwardRef } from 'react';

const ResumeTemplate = forwardRef(({ profile }, ref) => {
  if (!profile) return null;

  return (
      <div 
        ref={ref} 
        style={{
          display: 'none', // Will be toggled to 'block' before capturing
          width: '794px',   // A4 width in pixels at 96 DPI
          minHeight: '1123px', // A4 height
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: '40px 50px',
          fontFamily: 'Arial, sans-serif',
          boxSizing: 'border-box',
          position: 'absolute',
          top: '-9999px',
          left: '-9999px'
        }}
      >
        {/* Header Section */}
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {profile.user?.name || 'Developer'}
          </h1>
          <p style={{ fontSize: '16px', margin: '0 0 10px 0', color: '#444' }}>
            {profile.status} {profile.company ? `at ${profile.company}` : ''}
          </p>
          
          <div style={{ fontSize: '12px', color: '#555', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {profile.user?.email && <span>Email: {profile.user.email}</span>}
            {profile.location && <span>Location: {profile.location}</span>}
            {profile.socialLinks?.website && <span>Web: {profile.socialLinks.website}</span>}
            {profile.socialLinks?.linkedin && <span>LinkedIn: {profile.socialLinks.linkedin}</span>}
            {(profile.githubusername || profile.socialLinks?.github) && <span>GitHub: {profile.githubusername || profile.socialLinks.github}</span>}
          </div>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px', textTransform: 'uppercase', color: '#222' }}>
              Professional Summary
            </h2>
            <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0, color: '#333' }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px', textTransform: 'uppercase', color: '#222' }}>
              Skills & Technologies
            </h2>
            <div style={{ fontSize: '13px', color: '#333' }}>
              {profile.skills.join(' • ')}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {profile.experience && profile.experience.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px', textTransform: 'uppercase', color: '#222' }}>
              Experience
            </h2>
            {profile.experience.map(exp => (
              <div key={exp._id} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                  <h3 style={{ fontSize: '15px', margin: 0, color: '#111' }}>{exp.title}</h3>
                  <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    {new Date(exp.from).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {exp.current ? 'Present' : (exp.to ? new Date(exp.to).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '')}
                  </span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#444' }}>{exp.company}</p>
                {exp.description && (
                  <p style={{ fontSize: '13px', lineHeight: '1.4', margin: 0, color: '#333', whiteSpace: 'pre-wrap' }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects Section */}
        {profile.projects && profile.projects.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px', textTransform: 'uppercase', color: '#222' }}>
              Projects
            </h2>
            {profile.projects.map(prj => (
              <div key={prj._id} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                  <h3 style={{ fontSize: '15px', margin: 0, color: '#111' }}>
                    {prj.title} {prj.liveUrl && <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#0066cc' }}>({prj.liveUrl})</span>}
                  </h3>
                </div>
                {prj.technologies && prj.technologies.length > 0 && (
                  <p style={{ fontSize: '12px', fontStyle: 'italic', margin: '0 0 5px 0', color: '#555' }}>
                    Tech: {Array.isArray(prj.technologies) ? prj.technologies.join(', ') : prj.technologies}
                  </p>
                )}
                {prj.description && (
                  <p style={{ fontSize: '13px', lineHeight: '1.4', margin: 0, color: '#333' }}>
                    {prj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {profile.education && profile.education.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px', textTransform: 'uppercase', color: '#222' }}>
              Education
            </h2>
            {profile.education.map(edu => (
              <div key={edu._id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <h3 style={{ fontSize: '15px', margin: 0, color: '#111' }}>{edu.school}</h3>
                  <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    {new Date(edu.from).getFullYear()} - {edu.current ? 'Present' : (edu.to ? new Date(edu.to).getFullYear() : '')}
                  </span>
                </div>
                <p style={{ fontSize: '13px', margin: 0, color: '#444' }}>
                  {edu.degree} in {edu.fieldOfStudy}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
  );
});

export default ResumeTemplate;
