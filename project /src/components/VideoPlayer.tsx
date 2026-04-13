import { useState } from 'react';
import { Video, Play, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  videoUrls: string | null | undefined;
  maxVideos?: number;
  className?: string;
}

export const VideoPlayer = ({ videoUrls, maxVideos, className = '' }: VideoPlayerProps) => {
  const [activeVideo, setActiveVideo] = useState(0);

  if (!videoUrls || !videoUrls.trim()) {
    return null;
  }

  let videoLinks = videoUrls
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  if (maxVideos && maxVideos > 0) {
    videoLinks = videoLinks.slice(0, maxVideos);
  }

  if (videoLinks.length === 0) {
    return null;
  }

  const getEmbedUrl = (url: string): string | null => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
    }

    if (url.includes('dailymotion.com')) {
      const dailyId = url.split('video/')[1]?.split('?')[0];
      return dailyId ? `https://www.dailymotion.com/embed/video/${dailyId}` : null;
    }

    if (url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(videoLinks[activeVideo]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Video size={18} className="text-[#D4AF37]" />
          <h3 className="text-base font-semibold text-[#4A1D43]">
            Vidéos
          </h3>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {videoLinks.length} {videoLinks.length === 1 ? 'vidéo' : 'vidéos'}
        </div>
      </div>

      {embedUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-100" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`Vidéo ${activeVideo + 1}`}
            />
          </div>

          {videoLinks.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {videoLinks.map((url, index) => {
                const thumbEmbedUrl = getEmbedUrl(url);
                return (
                  <button
                    key={index}
                    onClick={() => setActiveVideo(index)}
                    className={`relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      index === activeVideo
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-lg scale-105'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                    title={`Vidéo ${index + 1}`}
                  >
                    {thumbEmbedUrl ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <Play size={24} className="text-white opacity-80" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Video size={20} className="text-gray-400" />
                      </div>
                    )}
                    {index === activeVideo && (
                      <div className="absolute inset-0 bg-[#D4AF37]/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#D4AF37] rounded-full shadow-lg"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] flex items-center justify-center">
              <ExternalLink size={28} className="text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#4A1D43] mb-1">Voir la vidéo</h4>
              <p className="text-sm text-gray-600 mb-3">Cette vidéo s'ouvre sur une plateforme externe</p>
              <a
                href={videoLinks[activeVideo]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] hover:from-[#5A2D53] hover:to-[#6A3D63] text-[#D4AF37] rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                <Play size={18} />
                Regarder la vidéo
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
