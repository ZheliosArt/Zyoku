"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useFollow = (currentUserId: string | undefined, targetUserId: string) => {
const [isFollowing, setIsFollowing] = useState(false);
const [loading, setLoading] = useState(true);

useEffect(() => {
if (!currentUserId || !targetUserId) return;

const checkFollow = async () => {
const { data } = await supabase
.from('seguidores')
.select('*')
.eq('seguidor_id', currentUserId)
.eq('seguido_id', targetUserId)
.single();

setIsFollowing(!!data);
setLoading(false);
};

checkFollow();
}, [currentUserId, targetUserId]);

const toggleFollow = async () => {
if (!currentUserId) return;

if (isFollowing) {
// Unfollow
await supabase
.from('seguidores')
.delete()
.eq('seguidor_id', currentUserId)
.eq('seguido_id', targetUserId);
setIsFollowing(false);
} else {
// Follow
await supabase
.from('seguidores')
.insert([{ seguidor_id: currentUserId, seguido_id: targetUserId }]);
setIsFollowing(true);
}
};

return { isFollowing, toggleFollow, loading };
};