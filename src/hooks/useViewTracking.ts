import { useEffect, useRef } from 'react';

const VIEW_TIMEOUT = 30000;

export function useViewTracking(entityId: string | null, entityType: 'entreprise' = 'entreprise') {
  const hasTrackedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    console.log('⚠️ useViewTracking DÉSACTIVÉ temporairement - ID:', entityId);
    return;
  }, [entityId, entityType]);
}
