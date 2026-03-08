import { create } from 'zustand';

import { Project } from '@/types/project';

export type ProjectScope = 'public' | 'private';

interface ProjectStoreState {
  publicProjects: Project[];
  privateProjects: Project[];
  setProjects: (scope: ProjectScope, projects: Project[]) => void;
  addProject: (scope: ProjectScope, project: Project) => void;
  updateProject: (scope: ProjectScope, project: Project) => void;
  removeProject: (scope: ProjectScope, id: string) => void;
  getProjectById: (id: string, scope?: ProjectScope) => Project | undefined;
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  publicProjects: [],
  privateProjects: [],

  setProjects: (scope, projects) =>
    set(() => (scope === 'public' ? { publicProjects: projects } : { privateProjects: projects })),

  addProject: (scope, project) =>
    set((state) =>
      scope === 'public'
        ? { publicProjects: [...state.publicProjects, project] }
        : { privateProjects: [...state.privateProjects, project] }
    ),

  updateProject: (scope, project) =>
    set((state) => {
      const source = scope === 'public' ? state.publicProjects : state.privateProjects;
      const updated = source.map((p) => (p._id === project._id ? { ...p, ...project } : p));
      return scope === 'public' ? { publicProjects: updated } : { privateProjects: updated };
    }),

  removeProject: (scope, id) =>
    set((state) => {
      const source = scope === 'public' ? state.publicProjects : state.privateProjects;
      const updated = source.filter((p) => p._id !== id);
      return scope === 'public' ? { publicProjects: updated } : { privateProjects: updated };
    }),

  getProjectById: (id, scope) => {
    if (scope === 'public') {
      return get().publicProjects.find((p) => p._id === id);
    }
    if (scope === 'private') {
      return get().privateProjects.find((p) => p._id === id);
    }
    return get().privateProjects.find((p) => p._id === id) ?? get().publicProjects.find((p) => p._id === id);
  },
}));
