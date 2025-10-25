import { useState, useEffect, useCallback } from 'react';
import { searchJobBoards, JobBoard } from '../lib/supabase';
import { trackSearch } from '../lib/analytics';

const PAGE_SIZE = 50; // Load 50 boards at a time

export const useJobBoards = (
  initialSearchTerm: string = '',
  initialIndustries: string[] = [],
  initialExperienceLevels: string[] = [],
  initialRemoteOnly: boolean = false,
  userId?: string
) => {
  const [allBoards, setAllBoards] = useState<JobBoard[]>([]);
  const [displayedBoards, setDisplayedBoards] = useState<JobBoard[]>([]);
  const [filteredBoards, setFilteredBoards] = useState<JobBoard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [industries, setIndustries] = useState<string[]>(initialIndustries);
  const [experienceLevels, setExperienceLevels] = useState<string[]>(initialExperienceLevels);
  const [remoteOnly, setRemoteOnly] = useState<boolean>(initialRemoteOnly);

  // Helper function to expand industry terms (handles all case variations and synonyms)
  const expandIndustryTerms = (selectedIndustries: string[]): string[] => {
    const expandedTerms: string[] = [];

    // Industry mapping: frontend filter → all database variations
    const industryMap: Record<string, string[]> = {
      tech: [
        'tech', 'Tech', 'Technology', 'technology',
        'IT', 'Information Technology', 'information technology',
        'Software', 'software', 'Software Engineering', 'software engineering',
        'SaaS', 'Software Development', 'DevOps', 'devops',
        'Cybersecurity', 'cybersecurity', 'Information Security',
        'Data Science', 'data science', 'Machine Learning',
        'Artificial Intelligence', 'AI', 'Cloud', 'Web Development'
      ],
      health: [
        'health', 'Health', 'Healthcare', 'healthcare',
        'Medical', 'medical', 'Clinical', 'clinical',
        'Nursing', 'nursing', 'Telehealth', 'Telemedicine',
        'Biotechnology', 'biotechnology', 'biotech', 'Biotech',
        'Pharmaceuticals', 'pharmaceuticals', 'pharmaceutical', 'pharma',
        'Public Health', 'public health', 'Global Health',
        'Health IT', 'health IT', 'Health Informatics', 'Clinical Informatics',
        'Clinical Research', 'clinical research', 'clinical trials',
        'Life Sciences', 'life sciences', 'Bioinformatics', 'bioinformatics',
        'Medical Devices', 'medical devices', 'Genomics', 'Computational Biology',
        'hospital', 'Hospital'
      ],
      nonprofit: [
        'nonprofit', 'Nonprofit', 'non-profit', 'Non Profit',
        'Philanthropy', 'philanthropy', 'Philanthropic',
        'NGO', 'ngo', 'Social Services', 'social services',
        'Social Impact', 'social impact', 'socialimpact',
        'Foundations', 'Foundation', 'Grantmaking', 'grantmaking',
        'Charity', 'charity', 'Humanitarian', 'Humanitarian Aid',
        'International Development', 'Community Development',
        'community development', 'Social Services', 'Social services'
      ],
      government: [
        'government', 'Government', 'Gov', 'gov',
        'Public Sector', 'public sector', 'Public sector',
        'Federal', 'federal', 'State', 'state',
        'Municipal', 'municipal', 'Local Government', 'local government',
        'Public Administration', 'public administration',
        'Civil Service', 'civil service', 'Public Service', 'public service',
        'Civic Tech', 'Defense', 'defense', 'Intelligence',
        'Law Enforcement', 'law enforcement', 'Public Safety'
      ],
      finance: [
        'finance', 'Finance', 'Financial', 'financial',
        'Fintech', 'fintech', 'Banking', 'banking',
        'Accounting', 'accounting', 'Accounting & Finance',
        'Investment', 'insurance', 'Insurance',
        'Revenue Operations', 'Procurement', 'procurement',
        'Purchasing', 'purchasing'
      ],
      education: [
        'education', 'Education', 'Educational',
        'Higher Education', 'higher education', 'K-12',
        'EdTech', 'edtech', 'Academic', 'academic',
        'Academia', 'academia', 'University', 'university',
        'School', 'school', 'Teaching', 'Faculty', 'faculty',
        'Learning & Development', 'Student', 'Libraries'
      ],
      climate: [
        'climate', 'Climate', 'Climate Tech', 'climate tech',
        'Sustainability', 'sustainability', 'Sustainable',
        'Environmental', 'environmental', 'Environment', 'environment',
        'Renewable Energy', 'renewable energy', 'Renewable',
        'Clean Energy', 'clean energy', 'cleantech',
        'Solar', 'solar', 'Green', 'Green building',
        'Carbon', 'carbon', 'ESG', 'Conservation', 'conservation',
        'Clean Technology', 'Utilities', 'Energy Policy', 'energy policy'
      ],
      design: [
        'design', 'Design', 'Designer',
        'UX', 'UI', 'UX/UI', 'UX Design', 'UI Design',
        'User Experience', 'User Research', 'UX Research',
        'Product Design', 'product design',
        'Graphic Design', 'Illustration',
        'Interaction Design', 'interaction design',
        'Creative', 'creative', 'Visual', 'Arts', 'arts'
      ],
      remote: [
        'remote', 'Remote', 'Remote Work', 'remote work',
        'Remote-only', 'remote-only', 'Telecommute', 'telecommute',
        'Work-from-home', 'work-from-home', 'Digital nomad',
        'Remote-friendly', 'remote-friendly', 'Distributed', 'Flexible work'
      ],
      startups: [
        'startups', 'Startups', 'Startup', 'startup',
        'Early-stage', 'Seed', 'Series A', 'Venture',
        'Entrepreneurship', 'Founder', 'Y Combinator'
      ],
      marketing: [
        'marketing', 'Marketing', 'Digital Marketing', 'digital marketing',
        'Content Marketing', 'content marketing', 'SEO', 'SEO/SEM',
        'Advertising', 'advertising', 'Communications', 'communications',
        'Public Relations', 'public relations', 'PR',
        'Social Media', 'Brand', 'Growth'
      ],
      engineering: [
        'engineering', 'Engineering', 'Engineer',
        'Software Engineering', 'software engineering',
        'Mechanical Engineering', 'Civil Engineering',
        'Electrical', 'Aerospace', 'Robotics', 'robotics',
        'Hardware', 'Manufacturing', 'manufacturing',
        'Construction', 'construction', 'Architecture', 'architecture'
      ],
      media: [
        'media', 'Media', 'Entertainment', 'entertainment',
        'Film', 'film', 'Television', 'television', 'TV',
        'Broadcasting', 'Broadcast', 'Journalism', 'journalism',
        'Publishing', 'Content', 'Podcasting', 'Music', 'music',
        'Audio', 'Video', 'Gaming', 'gaming', 'Esports'
      ]
    };

    selectedIndustries.forEach(industry => {
      const mapping = industryMap[industry.toLowerCase()];
      if (mapping) {
        expandedTerms.push(...mapping);
      } else {
        // If no mapping exists, add the term as-is
        expandedTerms.push(industry);
      }
    });

    return expandedTerms;
  };

  // Helper function to expand experience level terms (handles all case variations)
  const expandExperienceLevelTerms = (selectedLevels: string[]): string[] => {
    const expandedTerms: string[] = [];

    // Experience level mapping: frontend filter → all database variations
    const levelMap: Record<string, string[]> = {
      entry: [
        'Entry', 'entry', 'Entry-level', 'entry-level', 'Entry level',
        'entry_level', 'Early-career', 'early-career', 'Early career',
        'Junior', 'junior', '0-1 years'
      ],
      mid: [
        'Mid', 'mid', 'Mid-level', 'mid-level', 'Mid level',
        'mid_level', 'Mid-career', 'Experienced', 'experienced'
      ],
      senior: [
        'Senior', 'senior', 'Senior-level', 'senior-level', 'Senior level',
        'senior_level', 'Lead', 'lead', 'Staff', 'Principal',
        'Senior/Management', 'Senior/Executive'
      ],
      executive: [
        'Executive', 'executive', 'Director', 'director',
        'VP', 'C-level', 'Leadership', 'leadership',
        'Manager', 'manager', 'Management', 'management',
        'Director/Executive', 'Manager/Director', 'Managerial',
        'Executive/Leadership', 'Manager/Executive'
      ],
      internship: [
        'Internship', 'internship', 'Internships', 'internships',
        'Intern', 'intern', 'Co-op', 'Fellowship', 'fellowship',
        'Internship/Fellowship', 'Internship/Co-op',
        'Internship/Student', 'Student', 'Students'
      ]
    };

    selectedLevels.forEach(level => {
      const mapping = levelMap[level.toLowerCase()];
      if (mapping) {
        expandedTerms.push(...mapping);
      } else {
        // If no mapping exists, add the term as-is
        expandedTerms.push(level);
      }
    });

    return expandedTerms;
  };

  // Fetch all job boards initially (for filtering)
  useEffect(() => {
    const fetchAllBoards = async () => {
      try {
        setLoading(true);
        const boards = await searchJobBoards();
        setAllBoards(boards);
        setError(null);
      } catch (err) {
        console.error('Error fetching job boards:', err);
        setError('Failed to load job boards');
      } finally {
        setLoading(false);
      }
    };

    fetchAllBoards();
  }, []);

  // Apply filters and pagination
  useEffect(() => {
    const applyFilters = () => {
      try {
        let filtered = [...allBoards];

        // Apply search term filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(board =>
            board.name.toLowerCase().includes(term) ||
            board.board_summary.toLowerCase().includes(term) ||
            board.tags.some(tag => tag.toLowerCase().includes(term))
          );
        }

        // Apply industry filter with expanded terms
        if (industries.length > 0) {
          const expandedTerms = expandIndustryTerms(industries);
          filtered = filtered.filter(board =>
            board.industry.some(ind =>
              expandedTerms.some(term =>
                ind.toLowerCase().includes(term.toLowerCase()) ||
                term.toLowerCase().includes(ind.toLowerCase())
              )
            )
          );
        }

        // Apply experience level filter with expanded terms
        if (experienceLevels.length > 0) {
          const expandedLevels = expandExperienceLevelTerms(experienceLevels);
          filtered = filtered.filter(board =>
            board.experience_level.some(level =>
              expandedLevels.some(expandedLevel =>
                level.toLowerCase() === expandedLevel.toLowerCase()
              )
            )
          );
        }

        // Apply remote only filter
        if (remoteOnly) {
          filtered = filtered.filter(board => board.remote_friendly);
        }

        // Track search event (includes filters)
        if (searchTerm && searchTerm.length >= 3) {
          trackSearch(
            searchTerm,
            {
              industries,
              experienceLevels,
              remoteOnly
            },
            filtered.length,
            userId
          );
        }

        setFilteredBoards(filtered);

        // Reset pagination when filters change
        setPage(1);
        setHasMore(filtered.length > PAGE_SIZE);

        setError(null);
      } catch (err) {
        console.error('Error applying filters:', err);
        setError('Failed to apply filters');
      }
    };

    if (allBoards.length > 0) {
      applyFilters();
    }
  }, [searchTerm, industries, experienceLevels, remoteOnly, allBoards, userId]);

  // Update displayed boards based on current page
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * PAGE_SIZE;
    setDisplayedBoards(filteredBoards.slice(startIndex, endIndex));
    setHasMore(endIndex < filteredBoards.length);
  }, [page, filteredBoards]);

  // Load more boards (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      // Simulate async load for smooth UX
      setTimeout(() => {
        setPage(prev => prev + 1);
        setLoadingMore(false);
      }, 100);
    }
  }, [loadingMore, hasMore]);

  const updateSearchTerm = (term: string) => {
    setSearchTerm(term);
  };

  const toggleIndustry = (industry: string) => {
    if (industries.includes(industry)) {
      setIndustries(industries.filter(i => i !== industry));
    } else {
      setIndustries([...industries, industry]);
    }
  };

  const toggleExperienceLevel = (level: string) => {
    if (experienceLevels.includes(level)) {
      setExperienceLevels(experienceLevels.filter(l => l !== level));
    } else {
      setExperienceLevels([...experienceLevels, level]);
    }
  };

  const toggleRemoteOnly = () => {
    setRemoteOnly(!remoteOnly);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setIndustries([]);
    setExperienceLevels([]);
    setRemoteOnly(false);
  };

  return {
    jobBoards: displayedBoards,
    loading,
    loadingMore,
    error,
    searchTerm,
    industries,
    experienceLevels,
    remoteOnly,
    updateSearchTerm,
    toggleIndustry,
    toggleExperienceLevel,
    toggleRemoteOnly,
    clearFilters,
    boardsCount: filteredBoards.length,
    totalBoards: allBoards.length,
    loadMore,
    hasMore
  };
};
