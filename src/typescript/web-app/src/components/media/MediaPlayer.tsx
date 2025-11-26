/**
 * Media Player Components
 *
 * Professional media player components with:
 * - Audio/Video playback
 * - Custom controls
 * - Subtitle support
 * - Playlist management
 * - Analytics tracking
 * - Touch optimization
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  useMediaPlayer,
  MediaTrack,
  PlaylistItem,
  SubtitleTrack,
} from '../../utils/mediaPlayer'

// Format time utility
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Progress bar component
interface ProgressBarProps {
  current: number
  duration: number
  buffered?: number
  onSeek: (time: number) => void
  disabled?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  duration,
  buffered = 0,
  onSeek,
  disabled = false,
}) => {
  const progressRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState(0)

  const getPercentage = (value: number) => {
    return duration > 0 ? (value / duration) * 100 : 0
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      setIsDragging(true)
      updateSeekPosition(e)
    },
    [disabled]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      updateSeekPosition(e)
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onSeek(dragValue)
      setIsDragging(false)
    }
  }, [isDragging, dragValue, onSeek])

  const updateSeekPosition = (e: MouseEvent | React.MouseEvent) => {
    if (!progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const percentage = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    )
    const time = percentage * duration
    setDragValue(time)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const displayValue = isDragging ? dragValue : current

  return (
    <div className="progress-bar" ref={progressRef}>
      <div className="progress-track">
        <div
          className="progress-buffered"
          data-width={`${getPercentage(buffered)}%`}
        />
        <div
          className="progress-played"
          data-width={`${getPercentage(displayValue)}%`}
        />
        <div
          className="progress-handle"
          data-left={`${getPercentage(displayValue)}%`}
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  )
}

// Volume control component
interface VolumeControlProps {
  volume: number
  muted: boolean
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
}) => {
  const [showSlider, setShowSlider] = useState(false)

  const getVolumeIcon = () => {
    if (muted || volume === 0) return '🔇'
    if (volume < 0.3) return '🔈'
    if (volume < 0.7) return '🔉'
    return '🔊'
  }

  return (
    <div
      className="volume-control"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        className="volume-button"
        onClick={onMuteToggle}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </button>

      {showSlider && (
        <div className="volume-slider">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={e => onVolumeChange(parseFloat(e.target.value))}
            aria-label="Volume"
          />
        </div>
      )}
    </div>
  )
}

// Playback rate control
interface PlaybackRateControlProps {
  rate: number
  onRateChange: (rate: number) => void
}

const PlaybackRateControl: React.FC<PlaybackRateControlProps> = ({
  rate,
  onRateChange,
}) => {
  const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="playback-rate-control">
      <button
        className="rate-button"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Playback speed"
      >
        {rate}x
      </button>

      {showMenu && (
        <div className="rate-menu">
          {rates.map(r => (
            <button
              key={r}
              className={`rate-option ${r === rate ? 'active' : ''}`}
              onClick={() => {
                onRateChange(r)
                setShowMenu(false)
              }}
            >
              {r}x
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Subtitle display component
interface SubtitleDisplayProps {
  subtitle: string | null
  visible: boolean
}

const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({
  subtitle,
  visible,
}) => {
  if (!visible || !subtitle) return null

  return (
    <div className="subtitle-display">
      <div className="subtitle-text">
        {subtitle.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  )
}

// Subtitle control component
interface SubtitleControlProps {
  tracks: SubtitleTrack[]
  currentTrack: SubtitleTrack | null
  onTrackChange: (track: SubtitleTrack | null) => void
}

const SubtitleControl: React.FC<SubtitleControlProps> = ({
  tracks,
  currentTrack,
  onTrackChange,
}) => {
  const [showMenu, setShowMenu] = useState(false)

  if (tracks.length === 0) return null

  return (
    <div className="subtitle-control">
      <button
        className="subtitle-button"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Subtitles"
      >
        CC
      </button>

      {showMenu && (
        <div className="subtitle-menu">
          <button
            className={`subtitle-option ${!currentTrack ? 'active' : ''}`}
            onClick={() => {
              onTrackChange(null)
              setShowMenu(false)
            }}
          >
            Off
          </button>
          {tracks.map(track => (
            <button
              key={track.id}
              className={`subtitle-option ${currentTrack?.id === track.id ? 'active' : ''}`}
              onClick={() => {
                onTrackChange(track)
                setShowMenu(false)
              }}
            >
              {track.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Main media player component
interface MediaPlayerProps {
  track?: MediaTrack | undefined
  playlist?: PlaylistItem[] | undefined
  autoPlay?: boolean | undefined
  controls?: boolean | undefined
  className?: string | undefined
  onError?: ((error: string) => void) | undefined
  onTrackChange?: ((track: MediaTrack | null) => void) | undefined
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  track,
  playlist,
  autoPlay = false,
  controls = true,
  className = '',
  onError,
  onTrackChange,
}) => {
  const {
    mediaRef,
    currentTrack,
    mediaState,
    playlist: currentPlaylist,
    currentIndex,
    loadTrack,
    togglePlay,
    seek,
    seekBy,
    setVolume,
    toggleMute,
    setPlaybackRate,
    playNext,
    playPrevious,
    loadPlaylist,
    loadSubtitles,
    getCurrentSubtitle,
    toggleFullscreen,
    getAnalytics,
  } = useMediaPlayer(track)

  const [showSubtitles, setShowSubtitles] = useState(true)
  const [currentSubtitleTrack, setCurrentSubtitleTrack] =
    useState<SubtitleTrack | null>(null)

  // Load initial playlist
  useEffect(() => {
    if (playlist) {
      loadPlaylist(playlist)
    }
  }, [playlist, loadPlaylist])

  // Handle track changes
  useEffect(() => {
    if (currentTrack) {
      onTrackChange?.(currentTrack)
    }
  }, [currentTrack, onTrackChange])

  // Handle errors
  useEffect(() => {
    if (mediaState.error) {
      onError?.(mediaState.error)
    }
  }, [mediaState.error, onError])

  // Auto-play
  useEffect(() => {
    if (autoPlay && currentTrack && !mediaState.playing) {
      togglePlay()
    }
  }, [autoPlay, currentTrack, mediaState.playing, togglePlay])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          seekBy(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          seekBy(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(1, mediaState.volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, mediaState.volume - 0.1))
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    togglePlay,
    seekBy,
    setVolume,
    mediaState.volume,
    toggleMute,
    toggleFullscreen,
  ])

  const handleSubtitleTrackChange = async (track: SubtitleTrack | null) => {
    setCurrentSubtitleTrack(track)
    if (track) {
      try {
        await loadSubtitles(track)
      } catch (error) {
        console.error('Failed to load subtitles:', error)
      }
    }
  }

  const isVideo = currentTrack?.type === 'video'
  const currentSubtitle = getCurrentSubtitle()

  return (
    <div
      className={`media-player ${isVideo ? 'video-player' : 'audio-player'} ${className}`}
    >
      {isVideo ? (
        <div className="video-container">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            className="media-element"
            poster={currentTrack?.thumbnail}
          />
          <SubtitleDisplay
            subtitle={currentSubtitle}
            visible={showSubtitles && !!currentSubtitleTrack}
          />
        </div>
      ) : (
        <div className="audio-container">
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            className="media-element"
          />
          {currentTrack?.thumbnail && (
            <div className="audio-artwork">
              <img src={currentTrack.thumbnail} alt={currentTrack.title} />
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {mediaState.loading && (
        <div className="loading-indicator">
          <div className="spinner" />
        </div>
      )}

      {/* Error message */}
      {mediaState.error && (
        <div className="error-message">
          <span>⚠️ {mediaState.error}</span>
        </div>
      )}

      {/* Track info */}
      {currentTrack && (
        <div className="track-info">
          <div className="track-title">{currentTrack.title}</div>
          {currentTrack.artist && (
            <div className="track-artist">{currentTrack.artist}</div>
          )}
        </div>
      )}

      {/* Controls */}
      {controls && (
        <div className="media-controls">
          {/* Progress bar */}
          <div className="progress-section">
            <span className="time-current">
              {formatTime(mediaState.currentTime)}
            </span>

            <ProgressBar
              current={mediaState.currentTime}
              duration={mediaState.duration}
              onSeek={seek}
              disabled={mediaState.loading}
            />

            <span className="time-duration">
              {formatTime(mediaState.duration)}
            </span>
          </div>

          {/* Control buttons */}
          <div className="control-buttons">
            {/* Playlist controls */}
            {currentPlaylist.length > 0 && (
              <>
                <button
                  className="control-button previous"
                  onClick={playPrevious}
                  disabled={mediaState.loading}
                  aria-label="Previous track"
                >
                  ⏮️
                </button>
              </>
            )}

            {/* Seek backward */}
            <button
              className="control-button seek-back"
              onClick={() => seekBy(-10)}
              disabled={mediaState.loading}
              aria-label="Seek backward 10 seconds"
            >
              ⏪
            </button>

            {/* Play/pause */}
            <button
              className="control-button play-pause primary"
              onClick={togglePlay}
              disabled={mediaState.loading}
              aria-label={mediaState.playing ? 'Pause' : 'Play'}
            >
              {mediaState.loading ? '⏳' : mediaState.playing ? '⏸️' : '▶️'}
            </button>

            {/* Seek forward */}
            <button
              className="control-button seek-forward"
              onClick={() => seekBy(10)}
              disabled={mediaState.loading}
              aria-label="Seek forward 10 seconds"
            >
              ⏩
            </button>

            {/* Playlist controls */}
            {currentPlaylist.length > 0 && (
              <>
                <button
                  className="control-button next"
                  onClick={playNext}
                  disabled={mediaState.loading}
                  aria-label="Next track"
                >
                  ⏭️
                </button>
              </>
            )}

            {/* Volume control */}
            <VolumeControl
              volume={mediaState.volume}
              muted={mediaState.muted}
              onVolumeChange={setVolume}
              onMuteToggle={toggleMute}
            />

            {/* Playback rate */}
            <PlaybackRateControl
              rate={mediaState.playbackRate}
              onRateChange={setPlaybackRate}
            />

            {/* Subtitle control */}
            {currentTrack?.subtitles && (
              <SubtitleControl
                tracks={currentTrack.subtitles}
                currentTrack={currentSubtitleTrack}
                onTrackChange={handleSubtitleTrackChange}
              />
            )}

            {/* Fullscreen (video only) */}
            {isVideo && (
              <button
                className="control-button fullscreen"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen"
              >
                {mediaState.fullscreen ? '⛶' : '⛶'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Playlist */}
      {currentPlaylist.length > 0 && (
        <div className="playlist-section">
          <div className="playlist-header">
            <h3>Playlist ({currentPlaylist.length} tracks)</h3>
          </div>
          <div className="playlist-items">
            {currentPlaylist.map((item: PlaylistItem, index: number) => (
              <div
                key={item.id}
                className={`playlist-item ${index === currentIndex ? 'active' : ''} ${!item.enabled ? 'disabled' : ''}`}
                onClick={() => {
                  if (item.enabled) {
                    loadTrack(item)
                  }
                }}
              >
                <div className="playlist-item-number">
                  {index === currentIndex && mediaState.playing
                    ? '▶️'
                    : index + 1}
                </div>
                <div className="playlist-item-info">
                  <div className="playlist-item-title">{item.title}</div>
                  {item.artist && (
                    <div className="playlist-item-artist">{item.artist}</div>
                  )}
                </div>
                <div className="playlist-item-duration">
                  {formatTime(item.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaPlayer
