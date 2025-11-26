/**
 * Media Player Demo Page
 *
 * Demonstrates the comprehensive media player with:
 * - Video and audio playback
 * - Playlist management
 * - Subtitle support
 * - Various controls and features
 */

'use client'

import React, { useState, useEffect } from 'react'
import { HomeLayout } from '@/components/layout/HomeLayout'
import MediaPlayer from '../../../components/media/MediaPlayer'
import { MediaTrack, PlaylistItem } from '../../../utils/mediaPlayer'
import '../../../styles/media-player.css'

// Sample media tracks
const sampleVideoTrack: MediaTrack = {
  id: 'video-1',
  title: 'Sample Video',
  artist: 'Demo Creator',
  album: 'Demo Collection',
  duration: 120,
  src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  type: 'video',
  format: 'video/mp4',
  thumbnail:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
  subtitles: [
    {
      id: 'en',
      label: 'English',
      language: 'en',
      src: '/subtitles/sample-en.vtt',
      default: true,
    },
    {
      id: 'zh',
      label: '中文',
      language: 'zh',
      src: '/subtitles/sample-zh.vtt',
    },
  ],
  chapters: [
    {
      id: 'chapter-1',
      title: 'Introduction',
      startTime: 0,
      endTime: 30,
    },
    {
      id: 'chapter-2',
      title: 'Main Content',
      startTime: 30,
      endTime: 90,
    },
    {
      id: 'chapter-3',
      title: 'Conclusion',
      startTime: 90,
      endTime: 120,
    },
  ],
  metadata: {
    description: 'A sample video for testing the media player',
    tags: ['demo', 'test', 'sample'],
  },
}

const sampleAudioTrack: MediaTrack = {
  id: 'audio-1',
  title: 'Sample Audio',
  artist: 'Demo Artist',
  album: 'Demo Album',
  duration: 180,
  src: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  type: 'audio',
  format: 'audio/wav',
  thumbnail: 'https://via.placeholder.com/300x300/667eea/ffffff?text=Audio',
  metadata: {
    genre: 'Demo',
    year: 2024,
  },
}

const samplePlaylist: PlaylistItem[] = [
  {
    ...sampleVideoTrack,
    order: 1,
    enabled: true,
  },
  {
    ...sampleAudioTrack,
    id: 'audio-2',
    title: 'Another Audio Track',
    src: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
    order: 2,
    enabled: true,
  },
  {
    id: 'video-2',
    title: 'Second Video',
    artist: 'Demo Creator',
    album: 'Demo Collection',
    duration: 90,
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'video',
    format: 'video/mp4',
    thumbnail:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    order: 3,
    enabled: true,
  },
  {
    id: 'audio-3',
    title: 'Disabled Track',
    artist: 'Demo Artist',
    album: 'Demo Album',
    duration: 120,
    src: '',
    type: 'audio',
    format: 'audio/mp3',
    order: 4,
    enabled: false,
  },
]

export default function MediaPlayerDemo() {
  const [currentTrack, setCurrentTrack] = useState<MediaTrack | null>(null)
  const [playlistMode, setPlaylistMode] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [analytics, setAnalytics] = useState<any>(null)

  const handleTrackChange = (track: MediaTrack | null) => {
    setCurrentTrack(track)
  }

  const handleError = (error: string) => {
    console.error('Media player error:', error)
    alert(`Media Error: ${error}`)
  }

  const loadVideoTrack = () => {
    setCurrentTrack(sampleVideoTrack)
    setPlaylistMode(false)
  }

  const loadAudioTrack = () => {
    setCurrentTrack(sampleAudioTrack)
    setPlaylistMode(false)
  }

  const loadPlaylist = () => {
    setCurrentTrack(null)
    setPlaylistMode(true)
  }

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    // Demo analytics update
    const interval = setInterval(() => {
      // This would normally come from the media player's analytics
      setAnalytics({
        playCount: Math.floor(Math.random() * 10),
        totalWatchTime: Math.floor(Math.random() * 300),
        completionRate: Math.floor(Math.random() * 100),
        bufferEvents: Math.floor(Math.random() * 5),
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <HomeLayout>
      <div className={`demo-container ${theme}-theme`}>
        {/* Header */}
        <header className="demo-header">
          <h1>🎬 Media Player Demo</h1>
          <p>Comprehensive audio/video player with advanced features</p>

          <div className="demo-controls">
            <button onClick={loadVideoTrack} className="demo-button">
              📹 Load Video
            </button>
            <button onClick={loadAudioTrack} className="demo-button">
              🎵 Load Audio
            </button>
            <button onClick={loadPlaylist} className="demo-button">
              📋 Load Playlist
            </button>
            <button onClick={toggleTheme} className="demo-button theme-toggle">
              {theme === 'dark' ? '☀️' : '🌙'}{' '}
              {theme === 'dark' ? 'Light' : 'Dark'} Theme
            </button>
          </div>
        </header>

        {/* Media Player */}
        <main className="demo-main">
          <div className="player-container">
            <MediaPlayer
              {...(!playlistMode && currentTrack
                ? { track: currentTrack }
                : {})}
              {...(playlistMode ? { playlist: samplePlaylist } : {})}
              autoPlay={false}
              controls={true}
              className={`${theme}-theme`}
              onError={handleError}
              onTrackChange={handleTrackChange}
            />
          </div>

          {/* Current Track Info */}
          {currentTrack && (
            <div className="track-details">
              <h2>🎯 Current Track</h2>
              <div className="track-metadata">
                <div className="metadata-item">
                  <strong>Title:</strong> {currentTrack.title}
                </div>
                {currentTrack.artist && (
                  <div className="metadata-item">
                    <strong>Artist:</strong> {currentTrack.artist}
                  </div>
                )}
                {currentTrack.album && (
                  <div className="metadata-item">
                    <strong>Album:</strong> {currentTrack.album}
                  </div>
                )}
                <div className="metadata-item">
                  <strong>Duration:</strong>{' '}
                  {Math.floor(currentTrack.duration / 60)}:
                  {(currentTrack.duration % 60).toString().padStart(2, '0')}
                </div>
                <div className="metadata-item">
                  <strong>Type:</strong>{' '}
                  {currentTrack.type.charAt(0).toUpperCase() +
                    currentTrack.type.slice(1)}
                </div>
                <div className="metadata-item">
                  <strong>Format:</strong> {currentTrack.format}
                </div>
                {currentTrack.subtitles &&
                  currentTrack.subtitles.length > 0 && (
                    <div className="metadata-item">
                      <strong>Subtitles:</strong>{' '}
                      {currentTrack.subtitles
                        .map((s: any) => s.label)
                        .join(', ')}
                    </div>
                  )}
                {currentTrack.chapters && currentTrack.chapters.length > 0 && (
                  <div className="metadata-item">
                    <strong>Chapters:</strong> {currentTrack.chapters.length}{' '}
                    chapters
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Dashboard */}
          {analytics && (
            <div className="analytics-dashboard">
              <h2>📊 Analytics Dashboard</h2>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <div className="analytics-value">{analytics.playCount}</div>
                  <div className="analytics-label">Play Count</div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-value">
                    {Math.floor(analytics.totalWatchTime / 60)}m
                  </div>
                  <div className="analytics-label">Watch Time</div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-value">
                    {analytics.completionRate}%
                  </div>
                  <div className="analytics-label">Completion</div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-value">
                    {analytics.bufferEvents}
                  </div>
                  <div className="analytics-label">Buffer Events</div>
                </div>
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="features-section">
            <h2>✨ Features</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>🎬 Video Playback</h3>
                <p>High-quality video playback with multiple format support</p>
              </div>
              <div className="feature-item">
                <h3>🎵 Audio Playback</h3>
                <p>Rich audio playback with artwork and metadata display</p>
              </div>
              <div className="feature-item">
                <h3>📋 Playlist Management</h3>
                <p>Complete playlist support with shuffle and repeat modes</p>
              </div>
              <div className="feature-item">
                <h3>🎛️ Custom Controls</h3>
                <p>Professional media controls with keyboard shortcuts</p>
              </div>
              <div className="feature-item">
                <h3>📝 Subtitle Support</h3>
                <p>
                  Multi-language subtitle support with WebVTT and SRT formats
                </p>
              </div>
              <div className="feature-item">
                <h3>⚡ Quality Control</h3>
                <p>Adaptive quality selection based on connection speed</p>
              </div>
              <div className="feature-item">
                <h3>📊 Analytics</h3>
                <p>
                  Comprehensive playback analytics and user behavior tracking
                </p>
              </div>
              <div className="feature-item">
                <h3>📱 Touch Optimized</h3>
                <p>Touch-friendly controls for mobile devices</p>
              </div>
              <div className="feature-item">
                <h3>🌓 Theme Support</h3>
                <p>Dark and light themes with customizable styling</p>
              </div>
              <div className="feature-item">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <p>
                  Space: Play/Pause, ←/→: Seek, ↑/↓: Volume, M: Mute, F:
                  Fullscreen
                </p>
              </div>
              <div className="feature-item">
                <h3>🔄 Format Conversion</h3>
                <p>Automatic format detection and best quality selection</p>
              </div>
              <div className="feature-item">
                <h3>📶 Offline Support</h3>
                <p>Cached media playback for offline viewing</p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="shortcuts-section">
            <h2>⌨️ Keyboard Shortcuts</h2>
            <div className="shortcuts-grid">
              <div className="shortcut-item">
                <kbd>Space</kbd>
                <span>Play / Pause</span>
              </div>
              <div className="shortcut-item">
                <kbd>←</kbd>
                <span>Seek backward 10s</span>
              </div>
              <div className="shortcut-item">
                <kbd>→</kbd>
                <span>Seek forward 10s</span>
              </div>
              <div className="shortcut-item">
                <kbd>↑</kbd>
                <span>Volume up</span>
              </div>
              <div className="shortcut-item">
                <kbd>↓</kbd>
                <span>Volume down</span>
              </div>
              <div className="shortcut-item">
                <kbd>M</kbd>
                <span>Toggle mute</span>
              </div>
              <div className="shortcut-item">
                <kbd>F</kbd>
                <span>Toggle fullscreen</span>
              </div>
            </div>
          </div>
        </main>

        <style jsx>{`
          .demo-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            font-family:
              -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .light-theme {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .demo-header {
            text-align: center;
            padding: 2rem 1rem;
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
          }

          .demo-header h1 {
            font-size: 3rem;
            margin: 0 0 0.5rem 0;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .demo-header p {
            font-size: 1.2rem;
            margin: 0 0 2rem 0;
            opacity: 0.9;
          }

          .demo-controls {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .demo-button {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }

          .demo-button:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          }

          .theme-toggle {
            background: rgba(255, 193, 7, 0.2);
            border-color: rgba(255, 193, 7, 0.4);
          }

          .demo-main {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }

          .player-container {
            margin-bottom: 3rem;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .track-details {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 3rem;
          }

          .track-details h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.5rem;
          }

          .track-metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
          }

          .metadata-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 8px;
          }

          .metadata-item strong {
            color: #4ecdc4;
          }

          .analytics-dashboard {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 3rem;
          }

          .analytics-dashboard h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.5rem;
          }

          .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }

          .analytics-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
          }

          .analytics-value {
            font-size: 2rem;
            font-weight: bold;
            color: #4ecdc4;
            margin-bottom: 0.5rem;
          }

          .analytics-label {
            font-size: 0.9rem;
            opacity: 0.8;
          }

          .features-section,
          .shortcuts-section {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 3rem;
          }

          .features-section h2,
          .shortcuts-section h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.5rem;
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
          }

          .feature-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 1.5rem;
            border-radius: 8px;
          }

          .feature-item h3 {
            margin: 0 0 0.5rem 0;
            color: #4ecdc4;
            font-size: 1.1rem;
          }

          .feature-item p {
            margin: 0;
            opacity: 0.9;
            line-height: 1.5;
          }

          .shortcuts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .shortcut-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 8px;
          }

          kbd {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            font-family: monospace;
            font-size: 0.875rem;
            min-width: 2rem;
            text-align: center;
          }

          @media (max-width: 768px) {
            .demo-header h1 {
              font-size: 2rem;
            }

            .demo-header p {
              font-size: 1rem;
            }

            .demo-controls {
              gap: 0.5rem;
            }

            .demo-button {
              padding: 0.5rem 1rem;
              font-size: 0.9rem;
            }

            .demo-main {
              padding: 1rem;
            }

            .track-metadata {
              grid-template-columns: 1fr;
            }

            .analytics-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .features-grid {
              grid-template-columns: 1fr;
            }

            .shortcuts-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </HomeLayout>
  )
}
