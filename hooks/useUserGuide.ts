'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

export interface UserGuideState {
  hasSeenWelcome: boolean;
  hasCompletedTour: boolean;
  currentStep: number;
  tourActive: boolean;
  completedSteps: string[];
}

const STORAGE_KEY = 'beautybook_user_guide';

const defaultState: UserGuideState = {
  hasSeenWelcome: false,
  hasCompletedTour: false,
  currentStep: 0,
  tourActive: false,
  completedSteps: [],
};

export function useUserGuide() {
  const [state, setState] = useState<UserGuideState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({ ...defaultState, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load user guide state:', error);
    }
    setIsLoading(false);
  }, []);

  // Save state to localStorage
  const saveState = useCallback((newState: UserGuideState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save user guide state:', error);
    }
  }, []);

  const markWelcomeSeen = useCallback(() => {
    const newState = { ...state, hasSeenWelcome: true };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const startTour = useCallback(() => {
    const newState = { ...state, tourActive: true, currentStep: 0 };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const nextStep = useCallback(() => {
    const newState = { ...state, currentStep: state.currentStep + 1 };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const prevStep = useCallback(() => {
    const newState = { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const goToStep = useCallback((step: number) => {
    const newState = { ...state, currentStep: step };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const completeTour = useCallback(() => {
    const newState = {
      ...state,
      tourActive: false,
      hasCompletedTour: true,
      currentStep: 0
    };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const endTour = useCallback(() => {
    const newState = { ...state, tourActive: false, currentStep: 0 };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const markStepCompleted = useCallback((stepId: string) => {
    if (!state.completedSteps.includes(stepId)) {
      const newState = {
        ...state,
        completedSteps: [...state.completedSteps, stepId]
      };
      setState(newState);
      saveState(newState);
    }
  }, [state, saveState]);

  const resetGuide = useCallback(() => {
    setState(defaultState);
    saveState(defaultState);
  }, [saveState]);

  return {
    ...state,
    isLoading,
    markWelcomeSeen,
    startTour,
    nextStep,
    prevStep,
    goToStep,
    completeTour,
    endTour,
    markStepCompleted,
    resetGuide,
  };
}
