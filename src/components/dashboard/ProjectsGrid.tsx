'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Project, getUserProjects, deleteProject } from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, sortBy]);

  const loadProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    const { projects: userProjects, error } = await getUserProjects(user.uid);
    
    if (error) {
      setError(error);
    } else {
      setProjects(userProjects);
    }
    setLoading(false);
  };

  const filterAndSortProjects = () => {
    let filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'created':
          return b.createdAt.seconds - a.createdAt.seconds;
        case 'updated':
        default:
          return b.updatedAt.seconds - a.updatedAt.seconds;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await deleteProject(projectId);
    
    if (error) {
      toast.error('Failed to delete project');
    } else {
      toast.success('Project deleted successfully');
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  const handleNewProject = () => {
    router.push('/project/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-4 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleNewProject} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Start New Analysis
        </Button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <Plus className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? `No projects match "${searchTerm}". Try adjusting your search.`
              : 'Create your first environmental analysis project to get started.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={handleNewProject} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Start New Analysis
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}