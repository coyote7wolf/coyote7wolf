/**
 * Media Player Utilities
 *
 * Comprehensive media player functionality:
 * - Audio/Video playback
 * - Stream management
 * - Format conversion
 * - Playlist management
 * - Subtitles and captions
 * - Quality control
 * - Analytics tracking
 */

import { useCallback, useRef, useState, useEffect } from 'react'

// Media types and interfaces
export interface MediaTrack {
  id: string
  title: string
  artist?: string
  album?: string
  duration: number
  src: string
  type: 'audio' | 'video'
  format: string
  thumbnail?: string
  subtitles?: SubtitleTrack[]
  chapters?: ChapterTrack[]
  metadata?: Record<string, any>
}

export interface SubtitleTrack {
  id: string
  label: string
  language: string
  src: string
  default?: boolean
}

export interface ChapterTrack {
  id: string
  title: string
  startTime: number
  endTime: number
  thumbnail?: string
}

export interface PlaylistItem extends MediaTrack {
  order: number
  enabled: boolean
}

export interface MediaState {
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playing: boolean
  loading: boolean
  buffering: boolean
  ended: boolean
  error: string | null
  playbackRate: number
  quality: string
  fullscreen: boolean
}

export interface MediaAnalytics {
  playCount: number
  totalWatchTime: number
  completionRate: number
  skipEvents: { time: number; reason: string }[]
  qualityChanges: { time: number; quality: string }[]
  bufferEvents: { time: number; duration: number }[]
  errorEvents: { time: number; error: string }[]
}

// Default media state
const DEFAULT_MEDIA_STATE: MediaState = {
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  playing: false,
  loading: false,
  buffering: false,
  ended: false,
  error: null,
  playbackRate: 1,
  quality: 'auto',
  fullscreen: false,
}

// Media format utilities
export class MediaFormatManager {
  static supportedAudioFormats = [
    'audio/mpeg', // MP3
    'audio/mp4', // AAC, M4A
    'audio/ogg', // OGG
    'audio/wav', // WAV
    'audio/webm', // WebM Audio
    'audio/flac', // FLAC
    'audio/aac', // AAC
  ]

  static supportedVideoFormats = [
    'video/mp4', // MP4
    'video/webm', // WebM
    'video/ogg', // OGV
    'video/quicktime', // MOV
    'video/x-msvideo', // AVI
    'video/x-ms-wmv', // WMV
  ]

  static isSupported(format: string): boolean {
    return (
      this.supportedAudioFormats.includes(format) ||
      this.supportedVideoFormats.includes(format)
    )
  }

  static getMediaType(format: string): 'audio' | 'video' | 'unknown' {
    if (this.supportedAudioFormats.includes(format)) return 'audio'
    if (this.supportedVideoFormats.includes(format)) return 'video'
    return 'unknown'
  }

  static canPlayType(element: HTMLMediaElement, format: string): boolean {
    const support = element.canPlayType(format)
    return support === 'probably' || support === 'maybe'
  }

  static getBestFormat(
    element: HTMLMediaElement,
    formats: string[]
  ): string | null {
    // Prioritize formats by browser support
    const priorityOrder = [
      'video/mp4',
      'audio/mp4',
      'audio/mpeg',
      'video/webm',
      'audio/webm',
      'audio/ogg',
    ]

    for (const format of priorityOrder) {
      if (formats.includes(format) && this.canPlayType(element, format)) {
        return format
      }
    }

    // Fallback to first supported format
    return formats.find(format => this.canPlayType(element, format)) || null
  }
}

// Quality management
export class QualityManager {
  private qualities: { label: string; height?: number; bitrate?: number }[] = [
    { label: 'auto' },
    { label: '1080p', height: 1080, bitrate: 5000 },
    { label: '720p', height: 720, bitrate: 2500 },
    { label: '480p', height: 480, bitrate: 1000 },
    { label: '360p', height: 360, bitrate: 500 },
    { label: '240p', height: 240, bitrate: 250 },
  ]

  getAvailableQualities(): string[] {
    return this.qualities.map(q => q.label)
  }

  getBestQuality(connectionSpeed: number): string {
    // Estimate based on connection speed (in Mbps)
    if (connectionSpeed >= 5) return '1080p'
    if (connectionSpeed >= 2.5) return '720p'
    if (connectionSpeed >= 1) return '480p'
    if (connectionSpeed >= 0.5) return '360p'
    return '240p'
  }

  getQualityBitrate(quality: string): number {
    const q = this.qualities.find(item => item.label === quality)
    return q?.bitrate || 1000
  }
}

// Analytics manager
export class MediaAnalyticsManager {
  private analytics: MediaAnalytics = {
    playCount: 0,
    totalWatchTime: 0,
    completionRate: 0,
    skipEvents: [],
    qualityChanges: [],
    bufferEvents: [],
    errorEvents: [],
  }

  private startTime: number = 0
  private lastCurrentTime: number = 0

  onPlay(): void {
    this.analytics.playCount++
    this.startTime = Date.now()
  }

  onTimeUpdate(currentTime: number): void {
    if (Math.abs(currentTime - this.lastCurrentTime) > 2) {
      // Skip detected
      this.analytics.skipEvents.push({
        time: currentTime,
        reason: 'user_skip',
      })
    }
    this.lastCurrentTime = currentTime
  }

  onPause(currentTime: number): void {
    if (this.startTime > 0) {
      this.analytics.totalWatchTime += Date.now() - this.startTime
      this.startTime = 0
    }
  }

  onEnded(duration: number): void {
    this.onPause(duration)
    this.analytics.completionRate = Math.min(
      100,
      (this.lastCurrentTime / duration) * 100
    )
  }

  onQualityChange(quality: string): void {
    this.analytics.qualityChanges.push({
      time: Date.now(),
      quality,
    })
  }

  onBuffering(duration: number): void {
    this.analytics.bufferEvents.push({
      time: Date.now(),
      duration,
    })
  }

  onError(error: string): void {
    this.analytics.errorEvents.push({
      time: Date.now(),
      error,
    })
  }

  getAnalytics(): MediaAnalytics {
    return { ...this.analytics }
  }

  reset(): void {
    this.analytics = {
      playCount: 0,
      totalWatchTime: 0,
      completionRate: 0,
      skipEvents: [],
      qualityChanges: [],
      bufferEvents: [],
      errorEvents: [],
    }
    this.startTime = 0
    this.lastCurrentTime = 0
  }
}

// Subtitle manager
export class SubtitleManager {
  private currentTrack: SubtitleTrack | null = null
  private cues: { start: number; end: number; text: string }[] = []

  async loadSubtitles(track: SubtitleTrack): Promise<void> {
    try {
      const response = await fetch(track.src)
      const content = await response.text()

      if (track.src.endsWith('.vtt')) {
        this.cues = this.parseWebVTT(content)
      } else if (track.src.endsWith('.srt')) {
        this.cues = this.parseSRT(content)
      }

      this.currentTrack = track
    } catch (error) {
      console.error('Failed to load subtitles:', error)
      throw error
    }
  }

  private parseWebVTT(
    content: string
  ): { start: number; end: number; text: string }[] {
    const cues: { start: number; end: number; text: string }[] = []
    const lines = content.split('\n')
    let i = 0

    while (i < lines.length) {
      const line = lines[i]?.trim()
      if (!line) {
        i++
        continue
      }

      // Skip header and empty lines
      if (line.startsWith('WEBVTT') || line === '') {
        i++
        continue
      }

      // Look for timestamp line
      const timestampMatch = line.match(
        /(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/
      )
      if (timestampMatch && timestampMatch[1] && timestampMatch[2]) {
        const startTime = this.parseTimestamp(timestampMatch[1])
        const endTime = this.parseTimestamp(timestampMatch[2])

        // Collect text lines
        i++
        const textLines: string[] = []
        while (i < lines.length && lines[i]?.trim() !== '') {
          const textLine = lines[i]?.trim()
          if (textLine) {
            textLines.push(textLine)
          }
          i++
        }

        cues.push({
          start: startTime,
          end: endTime,
          text: textLines.join('\n'),
        })
      }
      i++
    }

    return cues
  }

  private parseSRT(
    content: string
  ): { start: number; end: number; text: string }[] {
    const cues: { start: number; end: number; text: string }[] = []
    const blocks = content.split('\n\n')

    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length < 3) continue

      // Skip sequence number (first line)
      const timestampLine = lines[1]
      if (!timestampLine) continue

      const timestampMatch = timestampLine.match(
        /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/
      )

      if (timestampMatch && timestampMatch[1] && timestampMatch[2]) {
        const startTime = this.parseTimestamp(
          timestampMatch[1].replace(',', '.')
        )
        const endTime = this.parseTimestamp(timestampMatch[2].replace(',', '.'))
        const text = lines.slice(2).join('\n')

        cues.push({ start: startTime, end: endTime, text })
      }
    }

    return cues
  }

  private parseTimestamp(timestamp: string): number {
    const parts = timestamp.split(':')
    if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) return 0

    const seconds = parts[2].split('.')
    if (seconds.length < 2 || !seconds[0] || !seconds[1]) return 0

    return (
      parseInt(parts[0]) * 3600 + // hours
      parseInt(parts[1]) * 60 + // minutes
      parseInt(seconds[0]) + // seconds
      parseInt(seconds[1]) / 1000 // milliseconds
    )
  }

  getCurrentCue(currentTime: number): string | null {
    const cue = this.cues.find(
      c => currentTime >= c.start && currentTime <= c.end
    )
    return cue?.text || null
  }

  getCurrentTrack(): SubtitleTrack | null {
    return this.currentTrack
  }

  clearSubtitles(): void {
    this.currentTrack = null
    this.cues = []
  }
}

// Main media player hook
export function useMediaPlayer(initialTrack?: MediaTrack) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const [currentTrack, setCurrentTrack] = useState<MediaTrack | null>(
    initialTrack || null
  )
  const [mediaState, setMediaState] = useState<MediaState>(DEFAULT_MEDIA_STATE)
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [subtitleManager] = useState(() => new SubtitleManager())
  const [analyticsManager] = useState(() => new MediaAnalyticsManager())
  const [qualityManager] = useState(() => new QualityManager())

  // Load media track
  const loadTrack = useCallback(
    async (track: MediaTrack) => {
      if (!mediaRef.current) return

      setMediaState(prev => ({ ...prev, loading: true, error: null }))

      try {
        setCurrentTrack(track)
        mediaRef.current.src = track.src

        // Load default subtitles
        if (track.subtitles?.length) {
          const defaultSub =
            track.subtitles.find(s => s.default) || track.subtitles[0]
          if (defaultSub) {
            await subtitleManager.loadSubtitles(defaultSub)
          }
        }

        analyticsManager.reset()
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load media'
        setMediaState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }))
        analyticsManager.onError(errorMessage)
      }
    },
    [subtitleManager, analyticsManager]
  )

  // Play/pause controls
  const play = useCallback(async () => {
    if (!mediaRef.current) return

    try {
      await mediaRef.current.play()
      analyticsManager.onPlay()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Playback failed'
      setMediaState(prev => ({ ...prev, error: errorMessage }))
      analyticsManager.onError(errorMessage)
    }
  }, [analyticsManager])

  const pause = useCallback(() => {
    if (!mediaRef.current) return

    mediaRef.current.pause()
    analyticsManager.onPause(mediaRef.current.currentTime)
  }, [analyticsManager])

  const togglePlay = useCallback(() => {
    if (mediaState.playing) {
      pause()
    } else {
      play()
    }
  }, [mediaState.playing, play, pause])

  // Seek controls
  const seek = useCallback(
    (time: number) => {
      if (!mediaRef.current) return

      mediaRef.current.currentTime = Math.max(
        0,
        Math.min(time, mediaState.duration)
      )
    },
    [mediaState.duration]
  )

  const seekBy = useCallback(
    (seconds: number) => {
      seek(mediaState.currentTime + seconds)
    },
    [mediaState.currentTime, seek]
  )

  // Volume controls
  const setVolume = useCallback((volume: number) => {
    if (!mediaRef.current) return

    const clampedVolume = Math.max(0, Math.min(1, volume))
    mediaRef.current.volume = clampedVolume
    setMediaState(prev => ({ ...prev, volume: clampedVolume }))
  }, [])

  const toggleMute = useCallback(() => {
    if (!mediaRef.current) return

    mediaRef.current.muted = !mediaRef.current.muted
    setMediaState(prev => ({ ...prev, muted: !prev.muted }))
  }, [])

  // Playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    if (!mediaRef.current) return

    mediaRef.current.playbackRate = rate
    setMediaState(prev => ({ ...prev, playbackRate: rate }))
  }, [])

  // Quality control
  const setQuality = useCallback(
    (quality: string) => {
      if (!currentTrack) return

      setMediaState(prev => ({ ...prev, quality }))
      analyticsManager.onQualityChange(quality)

      // In a real implementation, this would switch to different quality streams
      console.log(`Quality changed to: ${quality}`)
    },
    [currentTrack, analyticsManager]
  )

  // Playlist management
  const loadPlaylist = useCallback(
    (items: PlaylistItem[]) => {
      setPlaylist(items)
      if (items.length > 0 && items[0]) {
        setCurrentIndex(0)
        loadTrack(items[0])
      }
    },
    [loadTrack]
  )

  const playNext = useCallback(() => {
    if (playlist.length === 0) return

    const nextIndex = (currentIndex + 1) % playlist.length
    const nextTrack = playlist[nextIndex]
    if (nextTrack) {
      setCurrentIndex(nextIndex)
      loadTrack(nextTrack)
    }
  }, [playlist, currentIndex, loadTrack])

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return

    const prevIndex =
      currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    const prevTrack = playlist[prevIndex]
    if (prevTrack) {
      setCurrentIndex(prevIndex)
      loadTrack(prevTrack)
    }
  }, [playlist, currentIndex, loadTrack])

  const playTrackAtIndex = useCallback(
    (index: number) => {
      const track = playlist[index]
      if (track && index >= 0 && index < playlist.length) {
        setCurrentIndex(index)
        loadTrack(track)
      }
    },
    [playlist, loadTrack]
  )

  // Subtitle controls
  const loadSubtitles = useCallback(
    async (track: SubtitleTrack) => {
      try {
        await subtitleManager.loadSubtitles(track)
      } catch (error) {
        console.error('Failed to load subtitles:', error)
      }
    },
    [subtitleManager]
  )

  const getCurrentSubtitle = useCallback(() => {
    return subtitleManager.getCurrentCue(mediaState.currentTime)
  }, [subtitleManager, mediaState.currentTime])

  // Fullscreen control
  const toggleFullscreen = useCallback(async () => {
    if (!mediaRef.current) return

    try {
      if (!document.fullscreenElement) {
        await mediaRef.current.requestFullscreen()
        setMediaState(prev => ({ ...prev, fullscreen: true }))
      } else {
        await document.exitFullscreen()
        setMediaState(prev => ({ ...prev, fullscreen: false }))
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }, [])

  // Media event handlers
  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    const handleLoadStart = () => {
      setMediaState(prev => ({ ...prev, loading: true }))
    }

    const handleLoadedMetadata = () => {
      setMediaState(prev => ({
        ...prev,
        duration: media.duration,
        loading: false,
      }))
    }

    const handleTimeUpdate = () => {
      const currentTime = media.currentTime
      setMediaState(prev => ({ ...prev, currentTime }))
      analyticsManager.onTimeUpdate(currentTime)
    }

    const handlePlay = () => {
      setMediaState(prev => ({ ...prev, playing: true }))
    }

    const handlePause = () => {
      setMediaState(prev => ({ ...prev, playing: false }))
    }

    const handleEnded = () => {
      setMediaState(prev => ({ ...prev, ended: true, playing: false }))
      analyticsManager.onEnded(media.duration)

      // Auto-play next track if in playlist
      if (playlist.length > 0 && currentIndex < playlist.length - 1) {
        setTimeout(() => playNext(), 1000)
      }
    }

    const handleError = () => {
      const error = media.error
      const errorMessage = error
        ? `Media error: ${error.message}`
        : 'Unknown media error'
      setMediaState(prev => ({ ...prev, error: errorMessage, loading: false }))
      analyticsManager.onError(errorMessage)
    }

    const handleWaiting = () => {
      setMediaState(prev => ({ ...prev, buffering: true }))
    }

    const handleCanPlay = () => {
      setMediaState(prev => ({ ...prev, buffering: false, loading: false }))
    }

    const handleVolumeChange = () => {
      setMediaState(prev => ({
        ...prev,
        volume: media.volume,
        muted: media.muted,
      }))
    }

    // Add event listeners
    media.addEventListener('loadstart', handleLoadStart)
    media.addEventListener('loadedmetadata', handleLoadedMetadata)
    media.addEventListener('timeupdate', handleTimeUpdate)
    media.addEventListener('play', handlePlay)
    media.addEventListener('pause', handlePause)
    media.addEventListener('ended', handleEnded)
    media.addEventListener('error', handleError)
    media.addEventListener('waiting', handleWaiting)
    media.addEventListener('canplay', handleCanPlay)
    media.addEventListener('volumechange', handleVolumeChange)

    return () => {
      media.removeEventListener('loadstart', handleLoadStart)
      media.removeEventListener('loadedmetadata', handleLoadedMetadata)
      media.removeEventListener('timeupdate', handleTimeUpdate)
      media.removeEventListener('play', handlePlay)
      media.removeEventListener('pause', handlePause)
      media.removeEventListener('ended', handleEnded)
      media.removeEventListener('error', handleError)
      media.removeEventListener('waiting', handleWaiting)
      media.removeEventListener('canplay', handleCanPlay)
      media.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [playlist, currentIndex, playNext, analyticsManager])

  // Initialize with track
  useEffect(() => {
    if (initialTrack) {
      loadTrack(initialTrack)
    }
  }, [initialTrack, loadTrack])

  return {
    // Refs
    mediaRef,

    // State
    currentTrack,
    mediaState,
    playlist,
    currentIndex,

    // Controls
    loadTrack,
    play,
    pause,
    togglePlay,
    seek,
    seekBy,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setQuality,

    // Playlist
    loadPlaylist,
    playNext,
    playPrevious,
    playTrackAtIndex,

    // Subtitles
    loadSubtitles,
    getCurrentSubtitle,

    // Fullscreen
    toggleFullscreen,

    // Utilities
    formatManager: MediaFormatManager,
    qualityManager,
    analyticsManager,

    // Analytics
    getAnalytics: () => analyticsManager.getAnalytics(),
  }
}

export default useMediaPlayer
