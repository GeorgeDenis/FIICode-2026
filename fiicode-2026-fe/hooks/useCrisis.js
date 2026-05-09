import { useContext } from 'react';
import { CrisisContext } from '../contexts/CrisisContext';

export function useCrisis() {
  const context = useContext(CrisisContext);

  if (!context) {
    throw new Error('useCrisis must be used within a CrisisProvider');
  }

  return context;
}
