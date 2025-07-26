'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Project } from '@/lib/firebase/firestore';
import { MoreHorizontal, MapPin, Calendar, Trash2, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const handleView = () => {
    router.push(`/project/${project.id}`);
  };

  const handleEdit = () => {
    router.push(`/project/${project.id}?mode=edit`);
  };

  const handleDelete = () => {
    if (project.id) {
      onDelete(project.id);
      setShowDeleteDialog(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold truncate">
              {project.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {project.location}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Project Thumbnail */}
          <div className="w-full h-32 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-md mb-3 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-green-600 opacity-50" />
          </div>
          
          {/* Analysis Score */}
          {project.analysis && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Sustainability Score</span>
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full ${getScoreColor(project.analysis.compositeScore)}`}
                />
                <Badge variant="secondary">
                  {Math.round(project.analysis.compositeScore)}%
                </Badge>
              </div>
            </div>
          )}
          
          {/* Project Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(project.createdAt.toDate(), 'MMM d, yyyy')}
            </div>
            {project.geometry && (
              <Badge variant="outline" className="text-xs">
                {project.geometry.type}
              </Badge>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button onClick={handleView} className="flex-1" size="sm">
              Open Project
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}