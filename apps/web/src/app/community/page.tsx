'use client';

import React, { useState, useEffect } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  Users,
  ThumbsUp,
  MessageSquare,
  Plus,
  Send,
  X,
  Sparkles,
  Share2,
  Tag,
  Radio,
  Award
} from 'lucide-react';
import { realtimeGateway } from '@/lib/realtime-client';
import { UIUX_MEDIA } from '@/lib/uiux-assets';
import { LiquidGlassVideoCard } from '@/components/ui/LiquidGlassVideoCard';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  upvotes: number;
  comments: Comment[];
  commentsCount: number;
  tags: string[];
  badge?: string;
  createdAt: string;
}

export default function CommunityPage() {
  const [feed, setFeed] = useState<Post[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // New Post Form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('architecture, reliability');

  const loadFeed = () => {
    fetch('http://localhost:8000/api/v1/community/feed')
      .then((r) => r.json())
      .then((d) => setFeed(d))
      .catch(() => {});
  };

  useEffect(() => {
    loadFeed();

    // Subscribe to live community activity
    const unsubscribe = realtimeGateway.subscribe((envelope) => {
      if (envelope.type === 'COMMUNITY_ACTIVITY') {
        loadFeed();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpvote = async (postId: string) => {
    // Optimistic UI update
    setFeed((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );

    try {
      await fetch(`http://localhost:8000/api/v1/community/posts/${postId}/upvote`, {
        method: 'POST'
      });
    } catch (e) {
      loadFeed();
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    const text = commentText;
    setCommentText('');

    try {
      await fetch(`http://localhost:8000/api/v1/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'Astronaut Explorer',
          content: text
        })
      });
      loadFeed();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await fetch('http://localhost:8000/api/v1/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          tags: newTags.split(',').map((t) => t.trim()),
          author: 'Commander Shepard'
        })
      });
      setShowNewPostModal(false);
      setNewTitle('');
      setNewContent('');
      loadFeed();
    } catch (e) {
      alert('Failed to transmit post');
    }
  };

  const filteredFeed = feed.filter((p) => {
    if (selectedTag === 'ALL') return true;
    return p.tags?.includes(selectedTag);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-zinc-200" />
            <span>ASTRONAUT COMMUNITY HUB</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Live astronaut transmissions • Shared collections, peer debugging, and reputation badges
          </p>
        </div>

        <SpaceButton
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setShowNewPostModal(true)}
        >
          New Transmission
        </SpaceButton>
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'stripe', 'ai', 'webhooks', 'starter-kit', 'architecture', 'resilience'].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTag(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors shrink-0 ${
              selectedTag === t
                ? 'bg-white/10 text-zinc-200 border border-white/30 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            #{t}
          </button>
        ))}
      </div>

      {/* UIUX Live Community Broadcast Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiquidGlassVideoCard
          src={UIUX_MEDIA.communityStream1}
          title="Sub-orbital Engineering Pod 89: Distributed Rate Limiting Demo"
          badge="LIVE TRANSMISSION"
          category="ORBITAL CO-WORKING"
          glow="cyan"
        />
        <LiquidGlassVideoCard
          src={UIUX_MEDIA.communityStream2}
          title="Astronaut Architecture Roundtable: Event-Driven Webhooks"
          badge="ORBITAL BROADCAST"
          category="KEYNOTE STREAM"
          glow="purple"
        />
      </div>

      {/* Transmissions Feed */}
      <div className="space-y-4">
        {filteredFeed.map((post) => {
          const isCommentsOpen = activeCommentsPostId === post.id;
          return (
            <GlassPanel key={post.id} className="p-5 space-y-3">
              {/* Author & Badge Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-9 h-9 rounded-full border border-white/30 object-cover shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-white">{post.author}</h3>
                      {post.badge && (
                        <span className="text-[10px] font-mono text-zinc-200 bg-white/10 border border-white/30 px-2 py-0.5 rounded flex items-center gap-1">
                          <Award className="w-3 h-3 text-zinc-200" />
                          {post.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{post.createdAt}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {post.tags?.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-white/[0.06] backdrop-blur-xl text-[10px] font-mono text-zinc-200 border border-white/5">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Title & Body */}
              <h2 className="font-display font-bold text-base text-zinc-200">{post.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{post.content}</p>

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleUpvote(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-white/30 hover:text-zinc-200 transition-all active:scale-95"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-zinc-200" />
                    <span>{post.upvotes} Upvotes</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-white/30 hover:text-zinc-200 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-200" />
                    <span>{post.commentsCount || post.comments?.length || 0} Comments</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-200">
                  <Radio className="w-3 h-3 animate-ping" />
                  <span>LIVE TRANSMISSION</span>
                </div>
              </div>

              {/* Comments Section */}
              {isCommentsOpen && (
                <div className="pt-3 border-t border-white/10 space-y-3 font-mono text-xs">
                  <div className="space-y-2">
                    {post.comments?.map((c) => (
                      <div key={c.id} className="p-3 bg-white/[0.06] backdrop-blur-xl rounded-lg border border-white/5 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span className="text-zinc-200 font-bold">{c.author}</span>
                          <span>{c.createdAt}</span>
                        </div>
                        <p className="text-slate-200">{c.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      placeholder="Contribute to transmission..."
                      className="flex-1 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-sans"
                    />
                    <SpaceButton size="sm" variant="primary" icon={<Send className="w-3.5 h-3.5" />} onClick={() => handleAddComment(post.id)}>
                      Post
                    </SpaceButton>
                  </div>
                </div>
              )}
            </GlassPanel>
          );
        })}
      </div>

      {/* New Transmission Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassPanel glow="cyan" className="p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="font-display font-bold text-base text-white">Broadcast New Celestial Transmission</h2>
              <button onClick={() => setShowNewPostModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Transmission Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Best Practices for Idempotent Stripe Webhooks"
                  className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Content / Architecture Insights</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share code snippets, architectural patterns, or API reliability techniques..."
                  className="w-full h-32 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500 resize-none font-sans"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="stripe, webhooks, architecture"
                  className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <SpaceButton variant="ghost" size="sm" onClick={() => setShowNewPostModal(false)}>
                Cancel
              </SpaceButton>
              <SpaceButton variant="primary" size="sm" onClick={handleCreatePost}>
                Broadcast Transmission
              </SpaceButton>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
