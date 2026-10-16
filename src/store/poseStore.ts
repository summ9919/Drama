import { create } from 'zustand';
import { POSE_TEMPLATES } from '../constants/poseTemplates';
import { evaluatePoseMatch, type PoseMatchDetail } from '../lib/poseMatching';
import type { PoseKeypoint, PoseTemplate } from '../types/guidance';

export interface PoseState {
  enabled: boolean;
  selectedTemplateId: string | null;
  customTemplate: PoseTemplate | null;
  detectedKeypoints: PoseKeypoint[];
  matchDetail: PoseMatchDetail;

  // Actions
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  selectTemplate: (id: string | null) => void;
  setCustomPose: (template: PoseTemplate | null) => void;
  updateDetectedKeypoints: (keypoints: PoseKeypoint[]) => void;
  resetPose: () => void;

  // Getters
  getActiveTemplate: () => PoseTemplate | null;
}

const initialMatchDetail: PoseMatchDetail = {
  score: 0,
  matched: false,
  near: false,
  boneStatus: [],
  feedbackTip: '请对齐虚线火柴人',
};

export const usePoseStore = create<PoseState>((set, get) => ({
  enabled: false,
  selectedTemplateId: 'stand-natural',
  customTemplate: null,
  detectedKeypoints: [],
  matchDetail: initialMatchDetail,

  setEnabled: (enabled: boolean) => set({ enabled }),
  toggleEnabled: () => set(state => ({ enabled: !state.enabled })),

  selectTemplate: (id: string | null) => {
    set({ selectedTemplateId: id });
    const template = get().getActiveTemplate();
    if (template) {
      const match = evaluatePoseMatch(get().detectedKeypoints, template.keypoints);
      set({ matchDetail: match });
    }
  },

  setCustomPose: (template: PoseTemplate | null) => {
    set({ customTemplate: template, selectedTemplateId: template ? template.id : null });
  },

  updateDetectedKeypoints: (keypoints: PoseKeypoint[]) => {
    const template = get().getActiveTemplate();
    if (!template) {
      set({ detectedKeypoints: keypoints });
      return;
    }
    const match = evaluatePoseMatch(keypoints, template.keypoints);
    set({ detectedKeypoints: keypoints, matchDetail: match });
  },

  resetPose: () => {
    set({
      detectedKeypoints: [],
      matchDetail: initialMatchDetail,
    });
  },

  getActiveTemplate: () => {
    const { selectedTemplateId, customTemplate } = get();
    if (customTemplate && customTemplate.id === selectedTemplateId) {
      return customTemplate;
    }
    return POSE_TEMPLATES.find(t => t.id === selectedTemplateId) || POSE_TEMPLATES[0];
  },
}));
