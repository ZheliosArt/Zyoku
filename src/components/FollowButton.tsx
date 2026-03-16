"use client"
// Ruta: src/components/FollowButton.tsx

import React from 'react';
import { useFollow } from '../app/hooks/useFollow';

export default function FollowButton({ currentUserId, targetUserId }: { currentUserId: string | undefined, targetUserId: string }) {
  const { isFollowing, toggleFollow, loading } = useFollow(currentUserId, targetUserId);

  // LOG de depuración
  console.log("FollowButton - IDs:", { currentUserId, targetUserId, isFollowing });

  if (!currentUserId || currentUserId === targetUserId) return null;

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        console.log("Clic en Seguir...");
        toggleFollow();
      }}
      disabled={loading}
      style={{
        padding: '8px 24px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: isFollowing ? 'transparent' : '#00cfff',
        color: isFollowing ? '#00cfff' : '#050d1a',
        border: isFollowing ? '1px solid #00cfff44' : 'none',
        boxShadow: isFollowing ? 'none' : '0 0 15px rgba(0, 207, 255, 0.4)',
      }}
    >
      {loading ? '...' : (isFollowing ? 'Siguiendo' : 'Seguir')}
    </button>
  );
}