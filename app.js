// StreamHub Video Platform JavaScript

// Video data - Replace URLs with your actual video links
const videoData = {
  featuredVideo: {
    id: 'featured',
    title: 'Featured Video Title - Replace This',
    description: 'This is the main featured video description. Replace this text with your actual video description and update the video source URL in the HTML.',
    duration: '14:25',
    views: '3.2M',
    uploadDate: 'Today',
    videoUrl: 'https://xhaccess.com/videos/village-friends-hot-wife-indian-bhabhi-sex-xhi9Xkb', // Replace with your main video URL
    thumbnail: 'https://www.google.com/imgres?q=indian%20xxx&imgurl=https%3A%2F%2Fic-vt-nss.xhcdn.com%2Fa%2FN2MyMTFhNDJkOTg4ZGJiY2MwMzA2OTMxNmMwNTVlZmQ%2Fs(w%3A2560%2Ch%3A1440)%2Cwebp%2F009%2F925%2F604%2Fv2%2F2560x1440.206.webp&imgrefurl=https%3A%2F%2Fxhamster19.com%2Fsearch%2Fniks%2Bindian%2Bmaid&docid=ws-GjTxyl_3uzM&tbnid=fu7l6WEcIajasM&vet=12ahUKEwjE0PjlxMiPAxVERmwGHdoMJv4QM3oECBwQAA..i&w=1280&h=720&hcb=2&ved=2ahUKEwjE0PjlxMiPAxVERmwGHdoMJv4QM3oECBwQAA'
  },
  
  sampleVideos: [
    {
      id: 1,
      title: 'Sample Video 1',
      duration: '10:30',
      views: '1.2M',
      uploadDate: '2 days ago',
      thumbnail: 'https://via.placeholder.com/320x180/333333/ffffff?text=Video+1',
      videoUrl: 'PLACEHOLDER_FOR_VIDEO_URL_1', // Replace with actual video URL
      category: 'entertainment'
    },
    {
      id: 2,
      title: 'Sample Video 2', 
      duration: '15:45',
      views: '856K',
      uploadDate: '5 days ago',
      thumbnail: 'https://via.placeholder.com/320x180/333333/ffffff?text=Video+2',
      videoUrl: 'PLACEHOLDER_FOR_VIDEO_URL_2', // Replace with actual video URL
      category: 'education'
    },
    {
      id: 3,
      title: 'Sample Video 3',
      duration: '8:20',
      views: '2.1M', 
      uploadDate: '1 week ago',
      thumbnail: 'https://via.placeholder.com/320x180/333333/ffffff?text=Video+3',
      videoUrl: 'PLACEHOLDER_FOR_VIDEO_URL_3', // Replace with actual video URL
      category: 'technology'
    },
    {
      id: 4,
      title: 'Sample Video 4',
      duration: '12:15',
      views: '643K',
      uploadDate: '3 days ago', 
      thumbnail: 'https://via.placeholder.com/320x180/333333/ffffff?text=Video+4',
      videoUrl: 'PLACEHOLDER_FOR_VIDEO_URL_4', // Replace with actual video URL
      category: 'sports'
    },
    {
      id: 5,
      title: 'Sample Video 5',
      duration: '7:55',
      views: '1.8M',
      uploadDate: '1 day ago',
      thumbnail: 'https://via.placeholder.com/320x180/333333/ffffff?text=Video+5', 
      videoUrl: 'PLACEHOLDER_FOR_VIDEO_URL_5', // Replace with actual video URL
      category: 'music'
    },
    {
      id: 6,
      title: 'Sample Video 6',
      duration: '20:30',
      views: '934K',
      uploadDate: '4 days ago',
      thumbnail: 'https://via.placeholder.com/320x180/333333/ffffff?text=Video+6',
      videoUrl: 'PLACEHOLDER_FOR_VIDEO_URL_6', // Replace with actual video URL
      category: 'gaming'
    }
  ],
  
  categories: [
    'all',
    'trending',
    'entertainment', 
    'education',
    'sports',
    'music',
    'technology',
    'gaming',
    'news',
    'comedy'
  ]
};

// DOM Elements
const mainPlayer = document.getElementById('mainPlayer');
const videoTitle = document.getElementById('videoTitle');
const videoViews = document.getElementById('videoViews');
const videoDate = document.getElementById('videoDate');
const videoDescription = document.getElementById('videoDescription');
const watchVideoBtn = document.getElementById('watchVideoBtn');
const videoOverlay = document.querySelector('.video-overlay');
const videoGrid = document.getElementById('videoGrid');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.querySelector('.search-input');

// Current state
let currentVideo = videoData.featuredVideo;
let currentCategory = 'all';
let filteredVideos = [...videoData.sampleVideos];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Load initial video data
  loadFeaturedVideo();
  
  // Populate video grid
  renderVideoGrid();
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('StreamHub initialized successfully');
}

function loadFeaturedVideo() {
  // Update main video player with featured video data
  updateMainVideo(videoData.featuredVideo);
}

function updateMainVideo(video) {
  currentVideo = video;
  
  // Update video source - Replace placeholder with actual URL
  if (video.videoUrl !== 'PLACEHOLDER_FOR_MAIN_VIDEO_URL' && 
      video.videoUrl !== `PLACEHOLDER_FOR_VIDEO_URL_${video.id}`) {
    mainPlayer.src = video.videoUrl;
  }
  
  // Update poster image
  mainPlayer.poster = video.thumbnail;
  
  // Update video info
  videoTitle.textContent = video.title;
  videoViews.textContent = video.views + ' views';
  videoDate.textContent = video.uploadDate;
  
  if (video.description) {
    videoDescription.textContent = video.description;
  }
  
  // Show overlay again for new video
  videoOverlay.classList.remove('hidden');
  
  // Scroll to video player
  document.querySelector('.video-player-container').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

function setupEventListeners() {
  // Watch Video button
  watchVideoBtn.addEventListener('click', function() {
    playVideo();
  });
  
  // Video player events
  mainPlayer.addEventListener('play', function() {
    videoOverlay.classList.add('hidden');
  });
  
  mainPlayer.addEventListener('pause', function() {
    // Don't show overlay on pause, only on load
  });
  
  mainPlayer.addEventListener('ended', function() {
    videoOverlay.classList.remove('hidden');
    // Optionally redirect to main page or show related videos
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  });
  
  // Category buttons
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      const category = this.dataset.category;
      filterByCategory(category);
      updateActiveCategoryButton(this);
    });
  });
  
  // Search functionality
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    filterVideos(searchTerm);
  });
  
  // Video grid click delegation
  videoGrid.addEventListener('click', function(e) {
    const videoCard = e.target.closest('.video-card');
    if (videoCard) {
      const videoId = parseInt(videoCard.dataset.videoId);
      const selectedVideo = videoData.sampleVideos.find(v => v.id === videoId);
      if (selectedVideo) {
        updateMainVideo(selectedVideo);
      }
    }
  });
}

function playVideo() {
  if (currentVideo.videoUrl.startsWith('PLACEHOLDER_')) {
    // Show message if placeholder URL is still being used
    alert('Please replace the placeholder video URL in the code with your actual video URL.');
    return;
  }
  
  mainPlayer.play().catch(error => {
    console.error('Error playing video:', error);
    alert('Error playing video. Please check the video URL.');
  });
}

function renderVideoGrid() {
  if (!videoGrid) return;
  
  videoGrid.innerHTML = '';
  
  const videosToShow = filteredVideos.length > 0 ? filteredVideos : videoData.sampleVideos;
  
  videosToShow.forEach(video => {
    const videoCard = createVideoCard(video);
    videoGrid.appendChild(videoCard);
  });
}

function createVideoCard(video) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.dataset.videoId = video.id;
  card.tabIndex = 0; // Make keyboard accessible
  
  card.innerHTML = `
    <div class="video-thumbnail-container">
      <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
      <span class="video-duration">${video.duration}</span>
    </div>
    <div class="video-card-info">
      <h4 class="video-card-title">${video.title}</h4>
      <div class="video-card-meta">
        <span>${video.views} views</span>
        <span>${video.uploadDate}</span>
      </div>
    </div>
  `;
  
  // Add keyboard support
  card.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  });
  
  return card;
}

function filterByCategory(category) {
  currentCategory = category;
  
  if (category === 'all') {
    filteredVideos = [...videoData.sampleVideos];
  } else {
    filteredVideos = videoData.sampleVideos.filter(video => 
      video.category === category
    );
  }
  
  renderVideoGrid();
}

function updateActiveCategoryButton(activeButton) {
  categoryButtons.forEach(btn => btn.classList.remove('active'));
  activeButton.classList.add('active');
}

function filterVideos(searchTerm) {
  if (!searchTerm) {
    // Reset to category filter if no search term
    filterByCategory(currentCategory);
    return;
  }
  
  let baseVideos = currentCategory === 'all' 
    ? videoData.sampleVideos 
    : videoData.sampleVideos.filter(v => v.category === currentCategory);
  
  filteredVideos = baseVideos.filter(video =>
    video.title.toLowerCase().includes(searchTerm)
  );
  
  renderVideoGrid();
}

// Utility functions
function formatViews(views) {
  if (typeof views === 'string') return views;
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
}

function formatDuration(seconds) {
  if (typeof seconds === 'string') return seconds;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Navigation functions
function goToHome() {
  // Scroll to top and reset to featured video
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadFeaturedVideo();
  
  // Reset category filter
  const allButton = document.querySelector('.category-btn[data-category="all"]');
  if (allButton) {
    filterByCategory('all');
    updateActiveCategoryButton(allButton);
  }
  
  // Clear search
  if (searchInput) {
    searchInput.value = '';
  }
}

// Error handling
window.addEventListener('error', function(e) {
  console.error('Application error:', e.error);
});

// Video loading error handling
mainPlayer.addEventListener('error', function(e) {
  console.error('Video loading error:', e);
  const errorDiv = document.createElement('div');
  errorDiv.className = 'video-error';
  errorDiv.innerHTML = `
    <p>Error loading video. Please check the video URL.</p>
    <button class="btn btn--primary" onclick="location.reload()">Reload Page</button>
  `;
  errorDiv.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background: var(--color-video-surface);
    padding: var(--space-24);
    border-radius: var(--radius-lg);
    z-index: 10;
  `;
  
  const container = document.querySelector('.video-player-container');
  container.style.position = 'relative';
  container.appendChild(errorDiv);
});

// Performance optimization - lazy load video thumbnails
function lazyLoadImages() {
  const images = document.querySelectorAll('.video-thumbnail[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
    });
  }
}

// Call lazy loading after grid render
const originalRenderVideoGrid = renderVideoGrid;
renderVideoGrid = function() {
  originalRenderVideoGrid.call(this);
  setTimeout(lazyLoadImages, 100);
};

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Space bar to play/pause
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    if (mainPlayer.paused) {
      playVideo();
    } else {
      mainPlayer.pause();
    }
  }
  
  // Escape to go home
  if (e.key === 'Escape') {
    goToHome();
  }
});

// Export functions for external use (if needed)
window.StreamHub = {
  playVideo,
  goToHome,
  updateMainVideo,
  filterByCategory,
  videoData
};

console.log('StreamHub JavaScript loaded successfully');