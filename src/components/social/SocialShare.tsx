import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Facebook } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface SocialShareProps {
  resultType: 'quiz_score' | 'streak' | 'achievement' | 'leaderboard_rank';
  resultData: {
    title: string;
    score?: number;
    streak?: number;
    achievement?: string;
    rank?: number;
  };
}

export default function SocialShare({ resultType, resultData }: SocialShareProps) {
  const { user } = useAuthStore();
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function generateShareLink() {
    if (!user) return;

    setSharing(true);

    try {
      const { data, error } = await supabase
        .from('shared_results')
        .insert({
          user_id: user.id,
          result_type: resultType,
          result_data: resultData,
        })
        .select('share_token')
        .single();

      if (error) throw error;

      const baseUrl = window.location.origin;
      const url = `${baseUrl}/share/${data.share_token}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setSharing(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareToTwitter() {
    const text = getShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }

  function shareToFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }

  function getShareText() {
    switch (resultType) {
      case 'quiz_score':
        return `I scored ${resultData.score}% on ${resultData.title}! 🎯`;
      case 'streak':
        return `I've maintained a ${resultData.streak}-day study streak! 🔥`;
      case 'achievement':
        return `I just unlocked: ${resultData.achievement}! 🏆`;
      case 'leaderboard_rank':
        return `I'm ranked #${resultData.rank} on the leaderboard! 🌟`;
      default:
        return 'Check out my progress!';
    }
  }

  if (!shareUrl) {
    return (
      <Button
        variant="secondary"
        onClick={generateShareLink}
        disabled={sharing}
        className="gap-2"
      >
        <Share2 size={16} />
        {sharing ? 'Generating...' : 'Share Result'}
      </Button>
    );
  }

  return (
    <Card variant="default" padding="md" className="mt-4">
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Share your achievement:</p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={copyToClipboard}
            className="gap-1"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={shareToTwitter}
            className="flex-1 gap-2"
          >
            <Twitter size={16} />
            Twitter
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={shareToFacebook}
            className="flex-1 gap-2"
          >
            <Facebook size={16} />
            Facebook
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Link expires in 30 days
        </p>
      </div>
    </Card>
  );
}
