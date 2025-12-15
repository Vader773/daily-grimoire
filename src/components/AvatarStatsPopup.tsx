// This component is deprecated - use FullScreenStats instead
// Keeping for backwards compatibility, redirects to FullScreenStats

import { FullScreenStats } from './FullScreenStats';

interface AvatarStatsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarStatsPopup = ({ isOpen, onClose }: AvatarStatsPopupProps) => {
  return <FullScreenStats isOpen={isOpen} onClose={onClose} />;
};
